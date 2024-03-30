import fs from 'node:fs/promises';
import path from 'node:path';

import { normalizePath } from '@rollup/pluginutils';
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import c from 'picocolors';
import { workspaceRoot } from 'workspace-root';

import type { GetPkgSizeResponseData } from './types';

export function memoizeAsync<F extends (...params: any[]) => Promise<any>>(
    f: F,
    getCacheKey?: (...args: Parameters<F>) => string,
) {
    const cache = new Map<
        typeof getCacheKey extends undefined ? Parameters<F>[0] : string,
        Promise<Awaited<ReturnType<F>>>
    >();
    const memoizedFuncName = `memoized ${f.name}`;

    // use objet variable key to make meaningful function name
    const obj = {
        [memoizedFuncName](...params: Parameters<F>) {
            // return the cached promise when first param strict equal
            const firstParam = params[0];
            const key = typeof getCacheKey === 'function' ? getCacheKey(...params) : firstParam;
            if (!cache.has(key)) {
                cache.set(key, f(...params));
            }
            return cache.get(key)!;
        },
    };

    const _memoizedFunc = obj[memoizedFuncName];
    type MemoizedFunc = typeof _memoizedFunc & { destroy: () => void };

    const memoizedFunc = obj[memoizedFuncName] as MemoizedFunc;
    /**
     * Manually call destroy func to avoid memory leak
     */
    memoizedFunc.destroy = () => {
        cache.clear();
    };

    return memoizedFunc;
}

export function colorizeSize(kb: number, bracket = true) {
    if (Number.isNaN(kb)) return '';

    let colorFunc: (str: string) => string;
    if (kb > 1000) {
        colorFunc = c.red;
    } else if (kb > 100) {
        colorFunc = c.yellow;
    } else {
        colorFunc = c.green;
    }
    const colored = colorFunc(`${kb.toFixed(3)}kb`);
    return bracket ? `(${colored})` : colored;
}

export const getWorkspaceRootFolder = memoizeAsync(async () => {
    let workspaceRootFolder = await workspaceRoot();
    if (workspaceRootFolder) {
        workspaceRootFolder = normalizePath(workspaceRootFolder);
    }
    return workspaceRootFolder;
});

export const relativeToWorkspace = async (path: string) => {
    const workspaceRootFolder = await getWorkspaceRootFolder();
    if (workspaceRootFolder && path.startsWith(workspaceRootFolder)) {
        return path.slice(workspaceRootFolder.length + 1);
    }
    return path;
};

export const getPkgSize = memoizeAsync(
    async (name: string, version: string) => {
        let resp: AxiosResponse<GetPkgSizeResponseData>;
        try {
            resp = await axios.get<GetPkgSizeResponseData>(
                `https://bundlephobia.com/api/size?package=${name}@${version}`,
                {
                    timeout: 10 * 1000,
                },
            );
        } catch {
            return Number.NaN;
        }

        const bytes = resp.data.size;
        if (typeof bytes !== 'number') return Number.NaN;

        const kb = bytes / 1000;
        return kb;
    },
    (name, version) => `${name}@${version}`,
);

interface PkgInfo {
    name: string;
    version: string;
    directory: string;
}
export const packagePathRegex = /.*\/node_modules\/(?:@[^/]+\/)?[^/]+/;
export const getPackageInfo = memoizeAsync(
    async (id: string, deep: boolean, importer?: string): Promise<PkgInfo | null> => {
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
                    directory: normalizePath(path.dirname(packageJsonPath)),
                };
            } catch {
                // some package publish dist with a folder named node_modules
                const realPackagePath = id.slice(0, id.lastIndexOf('node_modules'));
                return getPackageInfo(realPackagePath, deep, importer);
            }
        }
        return null;
    },
);

export const formatImporter = memoizeAsync(async (importer: string, deep: boolean) => {
    importer = normalizePath(importer);

    if (packagePathRegex.test(importer)) {
        const packageInfo = await getPackageInfo(importer, deep);
        if (packageInfo) {
            return `${packageInfo.name}@${packageInfo.version}`;
        }
    }

    return relativeToWorkspace(importer);
});
