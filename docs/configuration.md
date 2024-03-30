# Configuration

view latest [source code](https://github.com/tjx666/unplugin-detect-duplicated-deps/blob/main/src/options.ts).

::: tip
You can use the `jsdoc` to check option `description` and `default value`.
:::

````ts
/**
 * ```plaintext
 * {
 *   'axios' => Map(2) {
 *     '1.4.0' => Map(1) {
 *       'node_modules/.pnpm/axios@1.4.0/node_modules/axios' => Set(1) ['tests/fixtures/mono/packages/pkg2/index.js']
 *     },
 *     '0.27.2' => Map(1) {
 *       'node_modules/.pnpm/axios@0.27.2/node_modules/axios' => Set(1) ['tests/fixtures/mono/packages/pkg1/index.js']
 *     }
 *   },
 *   '@yutengjing/foo' => Map(1) {
 *     '1.0.3' => Map(2) {
 *       'node_modules/.pnpm/@yutengjing+foo@1.0.3_vue@2.6.14/node_modules/@yutengjing/foo' => Set(1) ['tests/fixtures/mono/packages/pkg1/index.js'],
 *       'node_modules/.pnpm/@yutengjing+foo@1.0.3_vue@2.7.16/node_modules/@yutengjing/foo' => Set(1) ['tests/fixtures/mono/packages/pkg2/index.js']
 *     }
 *   }
 * }
 * ```
 */
export type PackagesInfo = Map<
  // pkg name
  string,
  Map<
    // pkg version
    string,
    Map<
      // pkg directory
      string,
      // importers
      Set<string>
    >
  >
>;

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
  customErrorMessage?: (packageToVersionsMap: PackagesInfo) => string;
}
````
