import { invoke } from "@tauri-apps/api";

export class Logger {
    static error(msg: string) {
        invoke("error_msg", {msg: msg});
    }

    static warn(msg: string) {
        invoke("warn_msg", {msg: msg});        
    }

    static info(msg: string) {
        invoke("info_msg", {msg: msg});        
    }

    static debug(msg: string) {
        invoke("debug_msg", {msg: msg});
    }

    static trace(msg: string) {
        invoke("trace_msg", {msg: msg});
    }

    static write(msg: string) {
        invoke('write', {msg: msg});
    }
}

export function cLog(msg: string) {
    invoke("write", {msg: msg});
}

export async function isDir(fp: string): Promise<boolean> {
    return invoke("is_dir", {filePath: fp});    
}

export async function isFile(fp: string): Promise<boolean> {
    return invoke("is_file", {filePath: fp});    
}

export async function copy(from: string, to: string, overwrite: boolean = false): Promise<boolean> {
    return invoke("copy", {from: from, to: to, overwrite: overwrite});
}

export async function openInExplorer(path: string) {
    return invoke("open_in_explorer", {path: path});
}

// meant to be used with dialogs since it omits a lot of characters
// limits the number of characters to be lineWidth
export function getFormattedPath(srcPath: string, lineWidth: number=30, emptyTolerance?: number) {
    emptyTolerance = emptyTolerance === undefined ? Math.floor(lineWidth / 3) : emptyTolerance;    
    let formattedPath = "";
    const parts = srcPath.split('\\');
    let curLen = 0;
    parts.forEach((value) => {
        curLen += value.length;
        formattedPath += (value + "\\");
        if(curLen + (emptyTolerance as number) > lineWidth) {
            // create new line at end
            formattedPath += "\n";
            curLen = 0;
        }
    })

    return formattedPath;
}