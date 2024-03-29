import fs from 'node:fs/promises';
import path from 'node:path';

import { normalizePath } from '@rollup/pluginutils';
import { highlight } from 'cardinal';
import consola from 'consola';
import c from 'picocolors';
import { gt } from 'semver';
import type { RollupPlugin, UnpluginOptions } from 'unplugin';
import { createUnplugin } from 'unplugin';
import { workspaceRoot } from 'workspace-root';

import type { Options } from './options';
import { colorizeSize, getPkgSize as _getPkgSize, memoizeAsync } from './utils';

const getWorkspaceRootFolder = memoizeAsync(async () => {
    let workspaceRootFolder = await workspaceRoot();
    if (workspaceRootFolder) {
        workspaceRootFolder = normalizePath(workspaceRootFolder);
    }
    return workspaceRootFolder;
});

const getPkgSize = memoizeAsync(_getPkgSize, (name, version) => `${name}@${version}`);

export default createUnplugin<Options | undefined>((options) => {
    const name = 'unplugin-detect-duplicated-deps';

    const {
        ignore = {},
        showPkgSize = true,
        throwErrorWhenDuplicated = false,
        customErrorMessage,
        deep = true,
    } = options ?? {};

    const packagePathRegex = /.*\/node_modules\/(?:@[^/]+\/)?[^/]+/;
    const getPackageInfo: ((
        id: string,
        importer?: string,
    ) => Promise<{ name: string; version: string } | null>) & { destroy: () => void } =
        memoizeAsync(async (id: string, importer?: string) => {
            id = normalizePath(id);
            if (importer) {
                importer = normalizePath(importer);
            }

            if (!deep && importer && packagePathRegex.test(importer)) {
                return null;
            }

            const match = id.match(packagePathRegex);
            if (match) {
                const packageJsonPath = path.join(match[0], 'package.json');
                try {
                    const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                    return {
                        name: pkg.name,
                        version: pkg.version,
                    };
                } catch {
                    // some package publish dist with a folder named node_modules
                    const realPackagePath = id.slice(0, id.lastIndexOf('node_modules'));
                    return getPackageInfo(realPackagePath, importer);
                }
            }
            return null;
        });

    const formatImporter = memoizeAsync(async (importer: string) => {
        importer = normalizePath(importer);

        if (packagePathRegex.test(importer)) {
            const packageInfo = await getPackageInfo(importer);
            if (packageInfo) {
                return `${packageInfo.name}@${packageInfo.version}`;
            }
        }

        const workspaceRootFolder = await getWorkspaceRootFolder();
        if (workspaceRootFolder && importer.startsWith(workspaceRootFolder)) {
            return importer.slice(workspaceRootFolder.length + 1);
        }
        return importer;
    });

    /**
     * @example
     *     ```txt
     *     Map(2) {
     *         '@pixi/utils' => Map(2) {
     *           '7.0.0' => Set(1) { 'tests/fixtures/mono/packages/pkg2/index.js' },
     *           '7.2.4' => Set(1) { 'tests/fixtures/mono/packages/pkg1/index.js' }
     *         },
     *         'axios' => Map(2) {
     *           '0.27.2' => Set(1) { 'tests/fixtures/mono/packages/pkg2/index.js' },
     *           '1.4.0' => Set(1) { 'tests/fixtures/mono/packages/pkg1/index.js' }
     *         }
     *     }
     *     ```;
     */
    let packageToVersionsMap = new Map<string, Map<string, Set<string>>>();

    const parseModule = async (resolvedId: string, importer: string): Promise<undefined> => {
        const packageInfo = await getPackageInfo(resolvedId, importer);
        if (!packageInfo) return;

        const { name, version } = packageInfo;
        const formattedImporter = await formatImporter(importer);
        const existedVersionsMap = packageToVersionsMap.get(name);
        if (existedVersionsMap) {
            const existedImporters = existedVersionsMap.get(version);
            if (existedImporters) {
                existedImporters.add(formattedImporter);
            } else {
                existedVersionsMap.set(version, new Set([formattedImporter]));
            }
        } else {
            const versionMap = new Map<string, Set<string>>([
                [version, new Set([formattedImporter])],
            ]);
            packageToVersionsMap.set(name, versionMap);
        }
    };

    const resolveId: RollupPlugin['resolveId'] = async function (
        source,
        importer,
        options,
    ): Promise<undefined> {
        if (!importer || options.isEntry) return;

        const resolved = await this.resolve(source, importer, {
            ...options,
            skipSelf: true,
        });
        if (!resolved) return;

        return parseModule(resolved.id, importer);
    };

    const buildEnd: UnpluginOptions['buildEnd'] = async function () {
        // sort by package name
        packageToVersionsMap = new Map(
            [...packageToVersionsMap.entries()].sort((a, b) => a[0].localeCompare(b[0])),
        );

        for (const [packageName, versionsMap] of packageToVersionsMap.entries()) {
            packageToVersionsMap.set(
                packageName,
                // sort by semver version
                new Map(
                    [...versionsMap.entries()]
                        .sort((a, b) => (gt(a[0], b[0]) ? 1 : -1))
                        .map(([version, importerSet]) => {
                            // sort importers
                            return [version, new Set([...importerSet].sort())];
                        }),
                ),
            );
        }

        const duplicatedDeps: Record<string, string[]> = {};
        const issuePackagesMap = new Map<string, string[]>();
        for (const [packageName, versionsMap] of packageToVersionsMap.entries()) {
            if (versionsMap.size < 2) continue;

            duplicatedDeps[packageName] = [...versionsMap.keys()];
            for (const version of versionsMap.keys()) {
                const pass =
                    packageName in ignore &&
                    (ignore[packageName].includes('*') || ignore[packageName].includes(version));
                if (!pass) {
                    const newIssueVersions = issuePackagesMap.get(packageName) ?? [];
                    newIssueVersions.push(version);
                    issuePackagesMap.set(packageName, newIssueVersions);
                }
            }
        }
        if (issuePackagesMap.size === 0) return;

        const coloredDuplicatedPackageNames = [...issuePackagesMap.keys()]
            .map((name) => c.magenta(name))
            .join(', ');
        const outputMessages = [
            `multiple versions of ${coloredDuplicatedPackageNames} is bundled!`,
        ];
        const promises = [...issuePackagesMap.keys()].map(async (duplicatedPackage) => {
            const warningMessagesOfPackage: string[] = [];
            let longestVersionLength = Number.NEGATIVE_INFINITY;
            const sortedVersions = issuePackagesMap.get(duplicatedPackage)!;
            sortedVersions.forEach((v) => {
                if (v.length > longestVersionLength) {
                    longestVersionLength = v.length;
                }
            });

            let totalSize = 0;
            const _promises = sortedVersions.map(async (version) => {
                const importers = Array.from(
                    packageToVersionsMap.get(duplicatedPackage)!.get(version)!,
                );
                const colorizedVersion = c.bold(
                    c.yellow(version.padEnd(longestVersionLength, ' ')),
                );
                const colorizedImporters = importers
                    .filter((importer) => importer !== `${duplicatedPackage}@${version}`)
                    .map((name) => c.green(name))
                    .join(', ');
                if (showPkgSize) {
                    const pkgSize = await getPkgSize(duplicatedPackage, version);
                    totalSize += pkgSize;
                    // prettier-ignore
                    return `    - ${colorizedVersion}${colorizeSize(pkgSize)} imported by ${colorizedImporters}`;
                } else {
                    return `    - ${colorizedVersion} imported by ${colorizedImporters}`;
                }
            });
            warningMessagesOfPackage.push(...(await Promise.all(_promises)));
            warningMessagesOfPackage.unshift(
                `\n  ${c.magenta(duplicatedPackage)}${showPkgSize ? colorizeSize(totalSize) : ''}:`,
            );
            return warningMessagesOfPackage;
        });
        outputMessages.push(...(await Promise.all(promises)).flat());

        // output
        if (!throwErrorWhenDuplicated) {
            consola.warn(outputMessages.join('\n'));
        } else {
            if (customErrorMessage) {
                console.error(customErrorMessage(packageToVersionsMap));
            } else {
                consola.error(outputMessages.join('\n'));
                consola.info(
                    `Fix this error by eliminate the duplicated dependencies or adjust the ${c.magenta('ignore')} option.`,
                );
                consola.info(
                    `You can just copy following all duplicated dependencies as the value of ${c.magenta('ignore')} option:`,
                );
                console.log(`\n${highlight(JSON.stringify(duplicatedDeps, null, 4))}\n`);
            }

            // eslint-disable-next-line unicorn/no-process-exit
            process.exit(1);
        }

        // recycle cached promise
        getWorkspaceRootFolder.destroy();
        getPackageInfo.destroy();
        formatImporter.destroy();
        getPkgSize.destroy();
    };

    return {
        name,
        buildEnd,
        vite: {
            enforce: 'pre',
            resolveId,
        },
        rollup: {
            resolveId,
        },
        webpack(compiler) {
            compiler.hooks.normalModuleFactory.tap(
                `${name}.normalModuleFactory`,
                (normalModuleFactory) => {
                    normalModuleFactory.hooks.afterResolve.tapAsync(
                        `${name}.normalModuleFactory.afterResolve`,
                        (data, callback) => {
                            const importer = data.contextInfo.issuer;
                            const resolvedId = data.createData.resource;
                            if (importer && resolvedId) {
                                parseModule(resolvedId, importer)
                                    .then(() => {
                                        // eslint-disable-next-line promise/no-callback-in-promise
                                        callback(null);
                                    })
                                    .catch((error) => {
                                        // eslint-disable-next-line promise/no-callback-in-promise
                                        callback(error);
                                    });
                            } else {
                                callback(null);
                            }
                        },
                    );
                },
            );
        },
    };
});
