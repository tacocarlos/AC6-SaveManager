import { message } from "@tauri-apps/api/dialog";
import { createDir, exists, readDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { basename, dirname, join } from "@tauri-apps/api/path";

import { ItemID } from "../ItemID";
import { SaveData } from "../save-data/save";
import { ArchiveType, Archive, ArchiveMetadata, ArchiveTypes } from "./archive";
import { ARCHIVE_METADATA_NAME, SAVE_NAME } from "../constants/constant";
import { Logger, isDir, isFile } from "../../util";
import { AppConfig } from "../AppConfig";
import { SaveDataFileMetadata } from "../save-data/SaveDataFileMetadata";
import { SaveDataFile } from "../save-data/SaveDataFile";
import { dialog, invoke } from "@tauri-apps/api";
import { ArchiveManager } from "./archive_manager";


export class FolderArchiveMetadata implements ArchiveMetadata {
    archiveID: ItemID;
    archiveName: string;
    archiveType: ArchiveType;
    modifiedDate: Date;

    private constructor(archiveID: ItemID, name: string) {
        this.archiveID = archiveID;
        this.archiveName = name;
        this.archiveType = ArchiveTypes.Folder;
        this.modifiedDate = new Date(Date.now());
    }

    toString() {
        return `[${this.archiveID}]: ${this.archiveName} | ${this.modifiedDate.toDateString()}`;
    }

    static async fromFile(filePath: string): Promise<FolderArchiveMetadata> {
        Logger.info("loading archive file: " + filePath);
        const fileName = await basename(filePath);
        Logger.info(`Got '${fileName}' as file name`)
        if(fileName === ARCHIVE_METADATA_NAME) {
            return FolderArchiveMetadata.fromJSON(await readTextFile(filePath));
        }

        Logger.error("Failed to load archive file: " + filePath);
        if(!await exists(filePath)) {
            Logger.error('file not found: ' + filePath)
            return Promise.reject(new Error("File not found at " + filePath)); 
        }

        return Promise.reject(new Error("Unknown Error, file found but couldn't read"));
    }

    static fromJSON(jsonData: string): Promise<FolderArchiveMetadata> {
        let data = JSON.parse(jsonData);
        return FolderArchiveMetadata.verifyObject(data);
    }

    // TODO: maybe figure out a better way to verify the json obj
    private static verifyObject(obj: Object): Promise<FolderArchiveMetadata> {
        let md = new FolderArchiveMetadata("", "");
        let anyObj = <any>obj;

        if (obj.hasOwnProperty("archiveID")) {
            md.archiveID = anyObj.archiveID;            
        } else {
            return Promise.reject("Object metadata does not contain an ID");
        }

        if (obj.hasOwnProperty("archiveName")) {
            md.archiveName = anyObj.archiveName;            
        } else {
            return Promise.reject("Object metadata does not contain an archive name");
        }

        if (obj.hasOwnProperty("archiveType")) {
            md.archiveType = anyObj.archiveType;            
        } else {
            return Promise.reject("Object metadata does not contain the archive type");
        }

        if (obj.hasOwnProperty("modifiedDate")) {
            const modDate: Date = new Date(Date.parse(anyObj.modifiedDate));
            md.modifiedDate = modDate;
        } else {
            return Promise.reject("Object metadata does not contain a valid date");
        }

        return Promise.resolve(md);
    }

    static defaultMetadata(archiveID: ItemID) {
        return new FolderArchiveMetadata(archiveID, "AC6 Save Archive");
    }

    static getTestMetadata() {
        return FolderArchiveMetadata.defaultMetadata("[DEBUG]:FolderArchiveMetadata::TEST-ID");
    }

    async saveJSON(filePath: string): Promise<void> {
        const json = JSON.stringify(this, null, '\t');
        Logger.trace(json);
        return writeTextFile(filePath, json);
    }

    getArchiveID() { return this.archiveID; }
    getArchiveName() { return this.archiveName; }
    getArchiveType() { return ArchiveTypes.Folder; }
}


export class FolderArchive implements Archive {
    metadata: FolderArchiveMetadata;
    archivePath: string = "";

    saves: Map<ItemID, SaveDataFile>;
    saveIDs: Set<ItemID>;

    static async attemptReadFolderArchive(archivePath: string, manager?: ArchiveManager) : Promise<FolderArchive> {
        try {
            // attempt to resolve metadata pathing
            let metadataPath = archivePath;
            if(await basename(archivePath) !== ARCHIVE_METADATA_NAME) {
                // if the basename is not the archive metadata name then it might be root archive folder
                // i.e. readDir(archivePath) = [AC60000.sl2, *.json]
                let searchPath = archivePath;
                if(!(await isDir(searchPath))) {
                    searchPath = await dirname(searchPath);
                }

                // search directory for a metadata path
                let foundMetadata = false;
                for(const entry of await readDir(searchPath)) {
                    if(entry.name === undefined) {
                        continue; //ignore
                    }

                    if(entry.name === ARCHIVE_METADATA_NAME) {
                        metadataPath = entry.path;
                        foundMetadata = true;
                        break;
                    }
                }

                if(!foundMetadata) {
                    Logger.info(`Folder ${archivePath} did not contain a folder `)
                    return Promise.reject(null); // folder does not contain archive
                }
            }
            const md = await FolderArchiveMetadata.fromFile(metadataPath);
            const archive = await FolderArchive.createValidFolderArchive(md, metadataPath, manager);
            return Promise.resolve(archive);
        } catch(reason: any) {
            if(reason instanceof Error) {
                const err = reason as Error;
                Logger.error(err.message);
            } else {
                console.log(reason);
            }

            return Promise.reject();
        }
    }

    // TODO: change to `loadValidFolderArchive` since it does not actually create the archive
    static async createValidFolderArchive(metadata: FolderArchiveMetadata, archivePath: string, manager? : ArchiveManager) {
        const archive = new FolderArchive(metadata, archivePath);
        Logger.info("Created archive with path: " + archivePath);
        const discover_saves = async () => {
            Logger.debug("In `discover_saves`")

            try {
                const saves = await archive.discover();
                Logger.debug("saves: " + saves.join(", "));
                saves.map( async save => {

                    Logger.info(`Attempting to insert save with id=${save.getSaveID()} and name=${save.getMetadata().getName()}`);
                    if(archive.saveIDs.has(save.getSaveID())) {
                        await message(`Save at ${archivePath} has an ID that conflicts with another save in the archive.`, {'type' : 'warning'});

                        if(manager === undefined) {
                            Logger.error("Manager was not supplied: cannot resolve id");
                            return;
                        }
                        const shouldResolve = await dialog.confirm("Would you like to overrwrite the id?", { 'title': "Overwrite ID?", 'type': 'error'} );
                        if(!shouldResolve) {
                            return;                            
                        }
                        

                        const newID = manager.get_new_SaveID();
                        save.getMetadata().setID(newID); // :)
                        const saveFile = save as SaveDataFile;
                        try {
                            await saveFile.writeSave();
                        } catch(reason: any) {
                            if(reason instanceof Error) {
                                Logger.error(reason.message);
                            } else {
                                console.log(reason);
                            }
                            await dialog.message("Couldn't resolve id collision.", {"title": "ID Resolution Failure", 'type': 'error', 'okLabel': ':('});
                            return;
                        }
                    }

                    archive.saves.set(save.getSaveID(), save);
                    archive.saveIDs.add(save.getSaveID());
                })
            } catch(reason: any) {
                if(reason instanceof Error) {
                    Logger.error(reason.message);
                } else {
                    console.log(reason);
                }

                throw new Error(reason);
            }
            Logger.debug("Done in `discover_saves`")
        }

        isDir(archivePath).then(async res => {
            if(res) {
                Logger.trace("`archivePath` is directory, discovering")
                archive.archivePath = archivePath;
                await discover_saves();
                // Logger.trace("Done discovering saves in archive location");
            } else {
                if(await basename(archivePath) === ARCHIVE_METADATA_NAME) {
                    Logger.trace("`archivePath` points to metadata, extracting dir and discovering saves")
                    archive.archivePath = await dirname(archivePath);
                    await discover_saves();
                    // Logger.trace("Done discovering saves in archive location");
                    // Array.from(archive.saves.values()).map(save => {
                    //     Logger.info(`\t${save.getMetadata().getName()}`)
                    // })
                } else {
                    Logger.error("`archivePath` does not point to either a directory or a metadata file.")
                    throw new Error("Failed to create FolderArchive");
                }
            }
        });

        return Promise.resolve(archive);
    }

    // creates a new archive at `basedir/metadata.archiveName`
    static async createNewFolderArchive(metadata: FolderArchiveMetadata, baseDir: string) {
        const archivePath = await join(baseDir, `${metadata.archiveName}-${metadata.archiveID}`);
        const metadataPath = await join(archivePath, ARCHIVE_METADATA_NAME);
        try {
            await createDir(archivePath);
            await metadata.saveJSON(metadataPath);
        } catch(reason: any) {
            throw new Error("Failed to create archive");
        }

        return new FolderArchive(metadata, metadataPath);
    }

    private constructor(metadata: FolderArchiveMetadata, archivePath: string) {
        this.metadata = metadata;
        this.saves = new Map<ItemID, SaveDataFile>();
        this.saveIDs = new Set<ItemID>();
        this.resolvePath(archivePath).then((validPath) => {
            this.archivePath = validPath;
        }).catch((reason) => {
            Logger.error(`Failed to identify the archive\n${reason}`);
            throw new Error("Archive path did not match a possible valid path");
        });
    }
    
    private async resolvePath(archivePath: string): Promise<string> {
        if(await isDir(archivePath)) {
            return archivePath;
        }

        if(await basename(archivePath) === ARCHIVE_METADATA_NAME) {
            return await dirname(archivePath);
        }

        return Promise.reject();
    }

    static fake_archive(metadata: FolderArchiveMetadata, archivePath: string) {
        return new FolderArchive(metadata, archivePath);
    }

    createFromActive(config: AppConfig): SaveData | undefined {
        throw new Error("Method not implemented." + config.get_executable_path());
    }

    overwriteSave(save: SaveDataFile): void {
        throw new Error("Method not implemented." + save.getMetadata().getID());
    }

    add_fake_save(id: ItemID, name: string = "FAKE SAVE") {
        const md = SaveDataFileMetadata.defaultVanillaMetadata(id);
        md.setName(name);

        const data = new SaveDataFile(md, "");
        this.addSave(data);
        return data;
    }

    setSave(id: string): fsResult {
        throw new Error("Method not implemented." + id);
    }
    backupAndSetSave(id: string): fsResult {
        throw new Error("Method not implemented." + id);
    }

    static async loadArchive(folderPath: string): Promise<Archive> {
        // const metadata = await FolderArchiveMetadata.fromFile(path.join(folderPath, "AC6"))
        // const archive: FolderArchive = new FolderArchive(() , folderPath);
        return Promise.reject("Not implemented. Callled with " + folderPath);
    }

    getMetadata(): FolderArchiveMetadata {
        return this.metadata;
    }

    getArchiveID(): string {
        return this.metadata.archiveID;
    }
    getArchiveName(): string {
        return this.metadata.archiveName;
    }
    
    getArchiveType(): ArchiveType {
        return ArchiveTypes.Folder;
    }

    getNewSaveID(): string {
        return "id";
    }

    createDefaultSave(): SaveData {
        throw new Error("Method not implemented.");
    }

    getArchivePath(): string {
        // if(await isDir(this.archivePath)) {
        //     return this.archivePath;
        // } else if (await basename(this.archivePath) === ARCHIVE_METADATA_NAME) {
        //     return await dirname(this.archivePath);
        // }

        // return Promise.reject();
        return this.archivePath;
    }
    
    // searching for a folder containing ACSM-SaveMetadata.json and AC60000.sl2
    async discover(): Promise<SaveDataFile[]> {
        Logger.debug("Starting `this.discover()`")
        const save_metadata_paths: string[] = await invoke("scan_dir_for_saves", {path: this.archivePath});
        
        // Logger.debug("save paths: " + save_metadata_paths.join(", "));
        let saves: Array<SaveDataFile> = [];

        // TODO: 
        // do a check to see that the metadata path and save file exist
        // then create a Save File with that

        Logger.debug(`Got ${save_metadata_paths.length} paths`)        
        for(const mdPath of save_metadata_paths) {
            const saveDir = await dirname(mdPath);
            const save_path = await join(saveDir, SAVE_NAME);
    
            Logger.debug(`Got ${saveDir} as saveDir and ${save_path} as save_path`)
    
            if(!await exists(save_path) && !await isFile(save_path)) {
                Logger.error(`save_path{${save_path}} does not exist or it is not a file`);
                continue;
            }
    
            Logger.debug("Got valid potential save");
            try {
                Logger.debug("attempting to get save file metadata at " + mdPath )
                const md = await SaveDataFileMetadata.fromFile(mdPath);
                Logger.debug("got save metadata");
                const save = new SaveDataFile(md, save_path);
                save.metadataPath = mdPath;
                saves.push(save);
                Logger.debug("Added " + save.getFilePath() + " to saves");
            } catch(reason: any) {
                if(reason instanceof Error) {
                    Logger.error(reason.message);
                } else {
                    console.log(reason);
                }
                continue;
            }

        }

        Logger.debug("Done with `this.discover()`");
        return Promise.resolve(saves);
    }

    async deleteArchive() {
        throw new Error("deleteArchive() not implemented yet")
    }    

    toString(): string {
        return this.getArchiveName();
    }

    containsSave(id: ItemID): boolean {
        return this.saveIDs.has(id);
    }

    addSave(save: SaveDataFile): boolean {
        const id = save.getMetadata().getID();
        if(this.containsSave(id)) 
            return false;

        this.saveIDs.add(id);
        this.saves.set(id, save);
        return true;
    }

    hasSave(saveID: ItemID) {
        return this.saveIDs.has(saveID);
    }

    getSaves(): SaveDataFile[] {
        return Array.from(this.saves.values());
    }

    getSave(id: ItemID): SaveData | undefined {
        if(!this.containsSave(id)) return undefined;
        return this.saves.get(id);
    }

    getSavesByName(name: string): SaveData[] {
        Logger.info("Not going to search yet: " + name);
        return [];
    }
}