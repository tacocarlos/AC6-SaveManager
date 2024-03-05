import { invoke, os } from "@tauri-apps/api";
import { join, documentDir, dataDir } from "@tauri-apps/api/path";

export const TEMP_DIR_PATH = await os.tempdir();
export const TEMP_SAVE_NAME: string = "AC6.temp";
export const TEMP_SAVE_LOC: string = await join(TEMP_DIR_PATH, TEMP_SAVE_NAME);
export const ARCHIVE_METADATA_NAME: string = "AC6Archive.json";
export const SAVE_DATA_NAME: string = "AC6Save.json";
export const SAVE_NAME: string = "AC60000.sl2";
export const STEAM_INSTALL_PATH: string = await invoke("get_steam_install_path");
export const DOCUMENTS_DIR = await documentDir();
export const DATA_DIR = await dataDir();
export const AC6ROAMING = await join(DATA_DIR, 'ArmoredCore6');

export enum OS {
    Windows,
    Linux,
    Unsupported
}

const platform = await os.platform();


// don't like the nested ternary
export const OperatingSystem: OS = 
    (platform === "win32") ? 
        OS.Windows:  
        ( 
            (platform === "linux") ? 
                OS.Linux : 
                OS.Unsupported );