declare module 'suspend-react' {
    export function suspend<T>(fn: () => Promise<T>, keys?: any[]): T;
    export function preload(fn: () => Promise<any>, keys?: any[]): void;
    export function clear(keys?: any[]): void;
    export function peek(keys?: any[]): any;
}
