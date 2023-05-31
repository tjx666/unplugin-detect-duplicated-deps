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
