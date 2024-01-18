import type { AxiosResponse } from 'axios';
import axios from 'axios';
import c from 'picocolors';

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

export function colorizeSize(kb: number) {
    if (Number.isNaN(kb)) return '';

    let colorFunc: (str: string) => string;
    if (kb > 1000) {
        colorFunc = c.red;
    } else if (kb > 100) {
        colorFunc = c.yellow;
    } else {
        colorFunc = c.green;
    }
    return `(${colorFunc(`${kb.toFixed(3)}kb`)})`;
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
