import { appDataDir, appConfigDir, join, basename } from '@tauri-apps/api/path';
import { Logger, isDir } from '@util';
import { message } from '@tauri-apps/api/dialog';
import { AC6ROAMING, OperatingSystem, OS, SAVE_NAME} from "./constants/constant"
import { invoke } from '@tauri-apps/api';

import { exists, createDir, writeTextFile, readTextFile, readDir } from '@tauri-apps/api/fs';
import { process } from '@tauri-apps/api';

export const appConfigDirPath = await appConfigDir();
export const appDataDirPath = await appDataDir();

export const CONFIG_FILE_NAME = "AC6SM.config";

export const DEFAULT_ARCHIVE_PATH = await join(appDataDirPath, "Archives");
export const CONFIG_FILE_PATH = await join(appConfigDirPath, CONFIG_FILE_NAME);

export const DEFUALT_ARCHIVE_NAME = "Armored Core 6 Save Archive";

export class AppConfig {

    static SAVE_FILE_NAME = "AC60000.sl2";

    static configFileName = CONFIG_FILE_NAME;
    static configFilePath = CONFIG_FILE_PATH;
    static defaultArchiveLocation = DEFAULT_ARCHIVE_PATH;

    // need to know:
    // exec path
    exec_path: string;

    // where to look for for archives
    // will always look in AppData/ArmoredCore6-SaveManager/
    archive_paths: Array<string>;

    // path that houses the .sl2 file the game reads
    save_loc: string;

    private constructor() {
        this.exec_path = "";
        this.archive_paths = new Array<string>();
        this.archive_paths.push(DEFAULT_ARCHIVE_PATH);

        this.save_loc = "";
        Logger.debug(`new AppConfig:\n${this.toString()}`)
    }

    add_path(ap: string): boolean {
        if(this.archive_paths.find(path => path === ap) !== undefined) {
            return false;
        }

        // this.archive_paths.push(ap);
        this.archive_paths = [...this.archive_paths, ap];
        return true;
    }

    remove_path(ap: string): void {
        this.archive_paths = this.archive_paths.filter(path => ap !== path);
    }

    has_executable_path(): boolean {
        return this.exec_path !== "";
    }
    get_executable_path(): string {
        return this.exec_path;
    }

    async set_executable_path(exePath: string): Promise<void> {
        if(await exists(exePath)) {
            this.exec_path = exePath;
            return Promise.resolve();
        }

        return Promise.reject();
    }


    clear_path() {
        this.exec_path= "";
    }

    has_save_path(): boolean {
        return this.save_loc !== "AC6000";
    }

    get_save_path(): string {
        return this.save_loc;
    }

    // requires a path ending with original save file
    // e.g. "C:\...\AC6000.sl2"
    async set_save_path(savePath: string): Promise<void> {
        if( (await exists(savePath)) && await basename(savePath) === AppConfig.SAVE_FILE_NAME) {
            this.save_loc = savePath;
            return Promise.resolve();
        }

        return Promise.reject();
    }

    // Attempts to find the save location, usually in %APPDATA%\ArmoredCore6\<user-id>\
    // if many, then can't really tell which; return all of them and just let the callee pick one
    async findSaveLocation(): Promise<string[]> {
        const rootDir = AC6ROAMING;
        const savePaths: string[] = [];

        if(!await isDir(rootDir)) {
            return Promise.reject(savePaths);
        }

        // if only one user, then we'll at most find a single save path
        for(const rootEntry of await readDir(rootDir)) {
            if(!await isDir(rootEntry.path)) {
                continue;
            }

            for(const targetEntry of await readDir(rootEntry.path)) {
                if(targetEntry.name !== SAVE_NAME) {
                    continue;
                } else {
                    savePaths.push(targetEntry.path);
                    break;
                }
            }
        }

        if(savePaths.length === 0) {
            return Promise.reject(savePaths);
        }
       
        return Promise.resolve(savePaths);
    }

    async launch_game() {
        Logger.debug(`Attempting to launch\n\t${this.get_executable_path()}`);

        if(!this.has_executable_path()) {
            message("Executable path has not been set");
            return;
        }

        if(OperatingSystem !== OS.Windows) {
            message("Can only launch game on Windows");
            return;
        }

        const launch_status = await invoke("launch_app", {appPath: this.get_executable_path()});
        if(launch_status) {
            Logger.trace("Launched game: " + this.get_executable_path());
            await process.exit(0);
            return;
        } else {
            Logger.error("FAILED TO LAUNCH GAME");
            return;
        }
    }

    private static async createDir(dirPath: string): Promise<boolean> {
        if(!(await exists(dirPath))) {
            await createDir(dirPath);
            return Promise.resolve(true);
        } else {
            Logger.info(`${dirPath} already exists`)
        }

        return Promise.resolve(false);
    }

    private static async createConfigFolder() {
        await AppConfig.createDir(appConfigDirPath);
    }

    private static async createArchiveFolder() {
        await AppConfig.createDir(appDataDirPath);
        await AppConfig.createDir(this.defaultArchiveLocation);
    }

    // initializes folders relevant to application if needed
    static async init_fs() {
        await AppConfig.createConfigFolder();
        await AppConfig.createArchiveFolder();        
        Logger.trace("Initalized file system for AC6-SM");
    }

    static async init(): Promise<AppConfig> {
        Logger.trace("Starting config init...");

        await AppConfig.init_fs();

        if(!await exists(AppConfig.configFilePath)) {
            Logger.error("Config file not found, returning default");
            return AppConfig.default();
        }

        Logger.trace("Found config file, attempting to read");

        // config file exists; read contents
        const content: string = await readTextFile(AppConfig.configFilePath) as string;
        let data = JSON.parse(content);

        Logger.trace("verifying config object...");
        return AppConfig.verifyObject(data);
    }

    private static verifyObject(obj: Object): AppConfig {
        let config = AppConfig.default();
        let anyObj = obj as any;
        if(anyObj.hasOwnProperty("test")) {
            Logger.error("found invalid property");
        }

        // TODO: load exec path, archive_paths, and save_loc
        if(anyObj.hasOwnProperty("exec_path")) {
            config.set_executable_path(anyObj["exec_path"]);
            Logger.trace("got exec path");
        }

        if(anyObj.hasOwnProperty("archive_paths") && Array.isArray(anyObj.archive_paths)) {
            Logger.trace(`ap: ${anyObj.archive_paths[0]} | ${typeof(anyObj.archive_paths)} | ${Array.isArray(anyObj.archive_paths)}`);

            const paths = (anyObj.archive_paths as string[]).filter((path) => path !== DEFAULT_ARCHIVE_PATH);
            paths.forEach(p => {
                config.add_path(p);
            })

            Logger.debug("got archive paths: \n\t\t" + paths.join('\n\t\t'));
            Logger.trace(`\t${paths.join()}`)
        }


        Logger.trace("loaded config:\n" + config.toString());
        return config;
    }

    static default(): AppConfig {         
        return new AppConfig();
    }

    stringify() {
        return JSON.stringify(this, null, '\t');
    }

    toString() {
        return this.stringify();
    }

    async saveConfig(): Promise<void> {
        await AppConfig.init_fs();
        try {
            await writeTextFile(AppConfig.configFilePath, this.stringify());
            Logger.debug("saved config");
        } catch(err) {
            const errmsg = err instanceof Error ? (err as Error).message : "Error when saving config";
            Logger.error(errmsg)
            return Promise.reject();
        }
    }
}