/**
 * Interface for the applications main config file
 * @ignore
 */
export interface YuvConfig {
    apiBase: string;
    languages: {
        iso: string,
        label: string,
        dir?: Direction,
        fallback?: boolean
    }[];
}

export enum Direction {
    LTR = 'ltr',
    RTL = 'rtl'
}