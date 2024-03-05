
// as the name implies, manages all the archives in the app
// mostly meant to keep track of archives and their ids

import { ItemID } from "../ItemID";
import { Archive } from "./archive";
import { FolderArchive, FolderArchiveMetadata } from "./folder_archive";
import { IDService } from "../util/services";
import { AppConfig, DEFUALT_ARCHIVE_NAME } from "../AppConfig";
import { readDir, removeDir } from "@tauri-apps/api/fs";
import { Logger } from "@src/util";

export class ArchiveManager {

    archiveIDs: Set<ItemID>;
    archivePaths: Map<ItemID, string>;
    archives: Map<ItemID, Archive>;
    
    idService: IDService;
    
    constructor() {
        this.archiveIDs = new Set();
        this.archives = new Map();
        this.archivePaths = new Map();
        this.idService = new IDService();
    }
    
    private idExists(archiveID: ItemID) {
        return this.archiveIDs.has(archiveID);
    }
    
    private archiveExists(archive: Archive) {
        return this.idExists(archive.getArchiveID());
    }
    
    // TODO: figure out if this is actually a shallow clone
    // I figure it might just copy the mem addr but it could just as easily be cloning the data
    shallowClone(): ArchiveManager {
        const newManager = new ArchiveManager();
        
        newManager.archiveIDs = this.archiveIDs;
        newManager.archives = this.archives;
        newManager.idService = this.idService;
        newManager.archivePaths = this.archivePaths;
        
        return newManager;
    }
    
    deepClone(): ArchiveManager {
        throw new Error("ArchiveManager.deepClone() is not implemented");
        
        const newManager = new ArchiveManager();
        
        // clone id service
        
        // clone archievs
        
        // clone archiveIDs
        
        return newManager;
    }
    
    // goes to each path in config and load all the archives
    async discoverArchives(config: AppConfig) {
        for(const baseDir of config.archive_paths) {
            for(const candidateEntry of await readDir(baseDir)) {
                if(candidateEntry.name === undefined) {
                    continue;
                }

                try {
                    const archive = await FolderArchive.attemptReadFolderArchive(candidateEntry.path, this);
                    this.addArchive(archive);
                    Logger.info(`Added archive ${candidateEntry.path}`);
                } catch(reason) {
                    if(reason instanceof Error) {
                        Logger.error(reason.message);
                    } else if (reason == null) {
                        Logger.error("Failed to read archive");
                    } else {
                        console.log(`Failed to read archive: ${reason}`);
                    }
                }
            }
        }
        
        return Promise.resolve();
    }

    getArchive(id: ItemID | undefined): Archive | undefined {
        if(id === undefined) return undefined;
        return this.archives.get(id);
    }
    
    // TODO: remove later (for debugging)
    get_new_ArchiveID(): ItemID {
        return this.idService.get_new_ArchiveID();
    }
    
    get_new_SaveID(): ItemID {
        return this.idService.get_new_SaveID();
    }

    addArchive(archive: Archive): boolean {
        if(this.archiveExists(archive)) {
            return false;
        }
        
        this.archiveIDs.add(archive.getArchiveID());
        this.archives.set(archive.getArchiveID(), archive);
        return true;
    }

    async createFolderArchive(archivePath: string, archiveName: string) {
        const md = FolderArchiveMetadata.defaultMetadata(this.get_new_ArchiveID());
        md.archiveName = archiveName === "" ? DEFUALT_ARCHIVE_NAME : archiveName;        
        const archive = await FolderArchive.createNewFolderArchive(md, archivePath);
        return this.addArchive(archive)        
    }

    // removes archive from manager
    removeArchive(archiveID: ItemID): boolean {
        this.archiveIDs.delete(archiveID);
        this.archives.delete(archiveID);
        return true;
    }

    // Deletes archive from file system and removes from manager
    async deleteFolderArchive(archiveID: ItemID): Promise<void> {
        const archive = this.getArchive(archiveID);
        if(archive === undefined) {
            console.log("Archive not in manager");
            return Promise.reject(new Error("Archive ID was not present in the manager"))
        }

        if(!this.removeArchive(archiveID)) {
            console.log("Couldn't remove archive from manager");
            return Promise.reject();
        }
        
        const folderArchive = archive as FolderArchive;
        const archivePath = await folderArchive.getArchivePath();
        return removeDir(archivePath, { recursive: true});
    }

    /**
     * given a folder path and file metadata,
     * discover saves and add them to the given archive
     * 
     * @param folderPath 
     * @param metadata 
     */

    async loadFolderArchive(folderPath: string, metadata: FolderArchiveMetadata) {
        if(this.archiveIDs.has(metadata.getArchiveID())) {
            return false;
        }

        const archive = await FolderArchive.createValidFolderArchive(metadata, folderPath, this);
        this.archiveIDs.add(metadata.archiveID);
        this.archives.set(metadata.archiveID, archive);
    }


    getArchives(): Array<Archive> {
        return Array.from(this.archives.values()).sort( (a, b) => {
            const aID = a.getArchiveID();
            const bID = b.getArchiveID();

            if(aID > bID) return 1;
            if(bID < aID) return -1;

            return 0;
        });
    }

    clearArchives(): void {
        this.archiveIDs.clear();
        this.archives.clear();
    }

    toString(): string {
        let content: string = "Archive Names: ";
        this.archives.forEach( (archive) => {
            content += `${archive.getArchiveName()} | `
        })

        return content;
    }
}