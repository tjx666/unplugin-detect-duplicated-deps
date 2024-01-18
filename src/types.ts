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
