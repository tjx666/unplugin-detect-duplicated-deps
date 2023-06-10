import type { AxiosResponse } from 'axios';
import axios from 'axios';

export function memoizeAsync<F extends (...params: any[]) => Promise<any>>(f: F) {
    const cache = new Map<Parameters<F>[0], Promise<Awaited<ReturnType<F>>>>();
    const memoizedFuncName = `memoized ${f.name}`;

    // use objet variable key to make meaningful function name
    const obj = {
        [memoizedFuncName](...params: Parameters<F>) {
            // return the cached promise when first param strict equal
            const firstParam = params[0];
            if (!cache.has(firstParam)) {
                cache.set(firstParam, f(...params));
            }
            return cache.get(firstParam)!;
        },
    };

    const _memoizedFunc = obj[memoizedFuncName];
    type MemoizedFunc = typeof _memoizedFunc & { destroy: () => void };

    const memoizedFunc = obj[memoizedFuncName] as MemoizedFunc;
    /**
     * manually call destroy func to avoid memory leak
     */
    memoizedFunc.destroy = () => {
        cache.clear();
    };

    return memoizedFunc;
}

export interface Asset {
    gzip: number;
    name: string;
    size: number;
    type: string;
}

export interface DependencySize {
    approximateSize: number;
    name: string;
}

export interface GetPkgSizeResponseData {
    assets: Asset[];
    dependencyCount: number;
    dependencySizes: DependencySize[];
    description: string;
    gzip: number;
    hasJSModule: boolean;
    hasJSNext: boolean;
    hasSideEffects: boolean;
    isModuleType: boolean;
    name: string;
    repository: string;
    scoped: boolean;
    size?: number;
    version: string;
}

export async function getPkgSize(name: string, version: string) {
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
}
