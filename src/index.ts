import fs from 'node:fs/promises';
import path from 'node:path';

import consola from 'consola';
import pMemoize from 'p-memoize';
import c from 'picocolors';
import { gt } from 'semver';
import type { RollupPlugin } from 'unplugin';
import { createUnplugin } from 'unplugin';
import { workspaceRoot } from 'workspace-root';

export interface Options {}

const workspaceRootFolder = await workspaceRoot();

function parsePackageNameFromModulePath(id: string) {
    const packageNameRegex = /.*\/node_modules\/((?:@[^/]+\/)?[^/]+)/;
    const match = id.match(packageNameRegex);
    const packageName = match ? match[1] : id;
    if (workspaceRootFolder && packageName.startsWith(workspaceRootFolder)) {
        return packageName.slice(workspaceRootFolder.length + 1);
    }
    return packageName;
}

const getPackageInfo = pMemoize(async (id: string) => {
    const packagePathRegex = /.*\/node_modules\/(?:@[^/]+\/)?[^/]+/;
    const match = id.match(packagePathRegex);
    if (match) {
        const packageJsonPath = path.join(match[0], 'package.json');
        try {
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            return {
                name: packageJson.name,
                version: packageJson.version,
            };
        } catch (error: any) {
            consola.warn(`can't read package.json of module id ${id} : ${error.message}`);
        }
    }
    return null;
});

export default createUnplugin<Options | undefined>(() => {
    const name = 'unplugin-detect-duplicated-deps';
    /**
     * Map{
     *   'axios': Map{
     *     '0.0.1': Set['tests/fixtures/mono/packages/pkg2/index.js', 'axios-mock-adapter']
     *   }
     * }
     */
    const packageToVersionsMap = new Map<string, Map<string, Set<string>>>();

    const resolveId: RollupPlugin['resolveId'] = async function (source, importer, options) {
        if (!importer || options.isEntry) return;

        const resolved = await this.resolve(source, importer, {
            ...options,
            skipSelf: true,
        });

        if (resolved) {
            const packageInfo = await getPackageInfo(resolved.id);
            if (packageInfo) {
                const { name, version } = packageInfo;
                const existedVersionsMap = packageToVersionsMap.get(name);
                if (existedVersionsMap) {
                    const existedImporters = existedVersionsMap.get(version);
                    if (existedImporters) {
                        existedImporters.add(parsePackageNameFromModulePath(importer));
                    } else {
                        existedVersionsMap.set(
                            version,
                            new Set([parsePackageNameFromModulePath(importer)]),
                        );
                    }
                } else {
                    const versionMap = new Map<string, Set<string>>([
                        [version, new Set([parsePackageNameFromModulePath(importer)])],
                    ]);
                    packageToVersionsMap.set(name, versionMap);
                }
            }
        }
    };

    return {
        name,
        vite: {
            enforce: 'pre',
            resolveId,
        },
        rollup: {
            resolveId,
        },
        buildEnd() {
            const duplicatedPackages: string[] = [];
            for (const [packageName, versionsMap] of packageToVersionsMap.entries()) {
                if (versionsMap.size > 1) {
                    duplicatedPackages.push(packageName);
                }
            }
            if (duplicatedPackages.length === 0) return;

            const formattedDuplicatedPackageNames = duplicatedPackages
                .map((name) => c.magenta(name))
                .join(', ');
            consola.warn(`multiple versions of ${formattedDuplicatedPackageNames} is bundled!`);

            for (const duplicatedPackage of duplicatedPackages) {
                console.warn(`  ${c.magenta(duplicatedPackage)}:`);

                const sortedVersions = [
                    ...packageToVersionsMap.get(duplicatedPackage)!.keys(),
                ].sort((a, b) => (gt(a, b) ? 1 : -1));

                let longestVersionLength = Number.NEGATIVE_INFINITY;
                sortedVersions.forEach((v) => {
                    if (v.length > longestVersionLength) {
                        longestVersionLength = v.length;
                    }
                });

                for (const version of sortedVersions) {
                    const importers = Array.from(
                        packageToVersionsMap.get(duplicatedPackage)!.get(version)!,
                    );
                    const formattedVersion = c.bold(
                        c.yellow(version.padEnd(longestVersionLength, ' ')),
                    );
                    const formattedImporters = importers
                        .filter((name) => name !== duplicatedPackage)
                        .map((name) => c.green(name))
                        .join(', ');
                    console.warn(`    - ${formattedVersion} imported by ${formattedImporters}`);
                }
            }
            process.stdout.write('\n');
        },
    };
});
