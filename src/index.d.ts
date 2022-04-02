/// <reference types="react-scripts" />

declare module '*.less' {
    const styles: any;
    export = styles;
}
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'

interface Window {
    globalConfig: any;
}

namespace React {
    interface HTMLAttributes<T> {
        $trace?: any;
    }
}
