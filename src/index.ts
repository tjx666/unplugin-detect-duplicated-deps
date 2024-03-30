import { highlight } from 'cardinal';
import consola from 'consola';
import c from 'picocolors';
import { compare } from 'semver';
import type { RollupPlugin, UnpluginOptions } from 'unplugin';
import { createUnplugin } from 'unplugin';

import type { Options, PackagesInfo } from './options';
import {
    colorizeSize,
    formatImporter,
    getPackageInfo,
    getPkgSize,
    getWorkspaceRootFolder,
    relativeToWorkspace,
} from './utils';

export default createUnplugin<Options | undefined>((options) => {
    const name = 'unplugin-detect-duplicated-deps';

    let isVite = false;

    const {
        ignore = {},
        showPkgSize = true,
        throwErrorWhenDuplicated = false,
        customErrorMessage,
        deep = true,
    } = options ?? {};

    let packagesInfo: PackagesInfo = new Map();

    const parseModule = async (resolvedId: string, importer: string): Promise<undefined> => {
        const packageInfo = await getPackageInfo(resolvedId, deep, importer);
        if (!packageInfo) return;

        const { name, version, directory } = packageInfo;
        const formattedImporter = await formatImporter(importer, deep);
        const versionMap = packagesInfo.get(name);
        if (versionMap) {
            const directoryMap = versionMap.get(version);
            if (directoryMap) {
                if (directoryMap.has(directory)) {
                    directoryMap.get(directory)!.add(formattedImporter);
                } else {
                    directoryMap.set(directory, new Set([formattedImporter]));
                }
            } else {
                versionMap.set(version, new Map([[directory, new Set([formattedImporter])]]));
            }
        } else {
            const versionMap = new Map([
                [version, new Map([[directory, new Set([formattedImporter])]])],
            ]);
            packagesInfo.set(name, versionMap);
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
        // sort
        packagesInfo = new Map(
            [...packagesInfo.entries()]
                // sort by package name
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([name, versionMap]) => {
                    return [
                        name,
                        new Map(
                            [...versionMap.entries()]
                                // sort by semver version
                                .sort((a, b) => compare(a[0], b[0]))
                                .map(([version, directoryMap]) => {
                                    return [
                                        version,
                                        new Map(
                                            [...directoryMap.entries()]
                                                // sort by directory
                                                .sort((a, b) => a[0].localeCompare(b[0]))
                                                .map(([directory, importers]) => {
                                                    return [
                                                        directory,
                                                        new Set(
                                                            // sort by importer
                                                            [...importers].sort((a, b) =>
                                                                a.localeCompare(b),
                                                            ),
                                                        ),
                                                    ];
                                                }),
                                        ),
                                    ];
                                }),
                        ),
                    ];
                }),
        );

        // analyze duplicated packages
        const duplicatedDeps: Record<string, string[]> = {};
        const issuePackagesMap = new Map<string, string[]>();
        for (const [packageName, versionMap] of packagesInfo.entries()) {
            // multiple versions, or one version and multiple directories
            const isDuplicated =
                versionMap.size > 1 ||
                (versionMap.size === 1 && [...versionMap.values()][0].size > 1);
            if (!isDuplicated) continue;

            duplicatedDeps[packageName] = [...versionMap.keys()];
            for (const version of versionMap.keys()) {
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

        // join output messages
        const coloredDuplicatedPackageNames = [...issuePackagesMap.keys()]
            .map((name) => c.magenta(name))
            .join(', ');
        // output will be dim in vite
        // eslint-disable-next-line unicorn/escape-case, unicorn/no-hex-escape
        const resetTerminalDim = isVite ? '\x1b[0m' : '';
        const outputMessages = [
            `${resetTerminalDim}packages ${coloredDuplicatedPackageNames} is bundled multiple times!`,
        ];
        let optimizedSize = 0;
        const promises = [...issuePackagesMap.keys()].map(async (duplicatedPackage) => {
            const warningMessagesOfPackage: string[] = [];
            let longestVersionLength = Number.NEGATIVE_INFINITY;
            const versions = issuePackagesMap.get(duplicatedPackage)!;
            versions.forEach((v) => {
                if (v.length > longestVersionLength) {
                    longestVersionLength = v.length;
                }
            });

            let totalSize = 0;
            const _promises = versions.map(async (version, index) => {
                const directoryMap = packagesInfo.get(duplicatedPackage)!.get(version)!;

                let versionAndSize = c.bold(c.yellow(version.padEnd(longestVersionLength, ' ')));
                if (showPkgSize) {
                    const pkgSize = await getPkgSize(duplicatedPackage, version);
                    totalSize += pkgSize * directoryMap.size;
                    versionAndSize += colorizeSize(pkgSize);

                    if (index !== versions.length - 1) {
                        optimizedSize += pkgSize * directoryMap.size;
                    } else {
                        optimizedSize += pkgSize * (directoryMap.size - 1);
                    }
                }

                const getColorizedImporters = (importers: string[]) => {
                    return (
                        importers
                            // ignore self import
                            .filter((importer) => importer !== `${duplicatedPackage}@${version}`)
                            .map((name) => c.green(name))
                            .join(', ')
                    );
                };

                if (directoryMap.size === 1) {
                    const formattedImporters = getColorizedImporters(
                        Array.from([...directoryMap.values()][0]),
                    );
                    return `    - ${versionAndSize} imported by ${formattedImporters}`;
                } else {
                    const directories = [...directoryMap.keys()];
                    const directoriesAndImporters = await Promise.all(
                        directories.map(async (directory) => {
                            const formattedDirectory = c.bold(
                                c.cyan(await relativeToWorkspace(directory)),
                            );
                            const formattedImporters = getColorizedImporters([
                                ...directoryMap.get(directory)!,
                            ]);
                            return `      - ${formattedDirectory} imported by ${formattedImporters}`;
                        }),
                    );
                    return [`    - ${versionAndSize}`, ...directoriesAndImporters];
                }
            });
            warningMessagesOfPackage.push(...(await Promise.all(_promises)).flat());
            warningMessagesOfPackage.unshift(
                `\n  ${c.magenta(duplicatedPackage)}${showPkgSize ? colorizeSize(totalSize) : ''}:`,
            );
            return warningMessagesOfPackage;
        });
        outputMessages.push(...(await Promise.all(promises)).flat());

        if (showPkgSize) {
            outputMessages[0] = `${outputMessages[0].slice(0, -1)}, fix them can reduce the bundle size by ${colorizeSize(optimizedSize, false)}`;
        }

        // output
        if (!throwErrorWhenDuplicated) {
            consola.warn(outputMessages.join('\n'));
        } else {
            if (customErrorMessage) {
                console.error(customErrorMessage(packagesInfo));
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
            config() {
                isVite = true;
            },
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
