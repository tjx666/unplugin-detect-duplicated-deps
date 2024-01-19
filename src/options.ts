export interface Options {
    /**
     * Config the duplicated dependencies which will be ignored, you can pass `*` as version to ignore all versions
     *
     * @example
     * ```javascript
     *  {
     *      axios: ['0.17.4', '1.4.0']
     *  }
     *  ```
     * @default {}
     */
    ignore?: Record<string, string[]>;

    /**
     * Disable show package size can improve build speed because we get package size by api of https://bundlephobia.com/
     *
     * @default true
     */
    showPkgSize?: boolean;

    /**
     * Whether report the duplicated deps depended by another dep under node_modules
     *
     * @default true
     */
    deep?: boolean;

    /**
     * Enable this to make build failed when exists duplicated deps
     *
     * @default false
     */
    throwErrorWhenDuplicated?: boolean;

    /**
     * Custom the error message when exists duplicated deps
     */
    customErrorMessage?: (packageToVersionsMap: Map<string, Map<string, Set<string>>>) => string;
}
