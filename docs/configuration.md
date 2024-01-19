# Configuration

view latest [source code](https://github.com/tjx666/unplugin-detect-duplicated-deps/blob/main/src/options.ts).

::: tip
You can use the `jsdoc` to check option `description` and `default value`.
:::

````ts
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
   *
   * @example
   *
   * ```txt
   * packageToVersionsMap structure:
   *
   * Map(2) {
   *     '@pixi/utils' => Map(2) {
   *       '7.0.0' => Set(1) { 'tests/fixtures/mono/packages/pkg2/index.js' },
   *       '7.2.4' => Set(1) { 'tests/fixtures/mono/packages/pkg1/index.js' }
   *     },
   *     'axios' => Map(2) {
   *       '0.27.2' => Set(1) { 'tests/fixtures/mono/packages/pkg2/index.js' },
   *       '1.4.0' => Set(1) { 'tests/fixtures/mono/packages/pkg1/index.js' }
   *     }
   * }
   * ```
   */
  customErrorMessage?: (packageToVersionsMap: Map<string, Map<string, Set<string>>>) => string;
}
````
