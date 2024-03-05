import { AppConfig } from "../AppConfig";
import { ItemID } from "../ItemID";
import { SaveData } from "../save-data/save";

// export enum ArchiveType {
//     Folder,
//     Database, // might eventually create an archive that uses a database for easy sharing
// }

// update from later on: why bother making a new archive type when you can just download a zip and process that?

export const ArchiveTypes = {
    Folder: "folder",
    Database: "database",
} as const;

export type ArchiveType = typeof ArchiveTypes[keyof typeof ArchiveTypes];

// todo: implement logic to handle specifying if an archive is for a modded game

export interface ArchiveMetadata {
    getArchiveID(): ItemID;
    getArchiveName(): string;
    getArchiveType(): ArchiveType;
}

export interface Archive {

    /* Easy exposure of metadata */
    getMetadata(): ArchiveMetadata;
    getArchiveID(): string;
    getArchiveName(): string;
    getArchiveType(): ArchiveType;

    /*  Save creation/removal/modification */
    
    createDefaultSave(): SaveData; // creates, adds, and returns a 'default' save data (points to a New Game save file)
    createFromActive(config: AppConfig): SaveData | undefined; // uses currently active save to create a new save file, returning `undefined` if save_loc has not been set
    addSave(save: SaveData): boolean; // adds save to archive, failing if id already exists
    overwriteSave(save: SaveData): void; // adds save to archive, overwriting save if it already exists
    
    setSave(id: ItemID): fsResult; // overwrites currently active save
    backupAndSetSave(id: ItemID): fsResult; // creates a default 
    
    discover(): void; // loads all saves in archive structure

    /* Accessing saves */

    getSaves(): SaveData[];
    getSavesByName(name: string): SaveData[];
    getSave(id: ItemID): SaveData | undefined;
    hasSave(saveID: ItemID): boolean;


    // Other
    
    deleteArchive(): void; // deletes archive and all saves within it
    toString(): string // returns all of the save names currently in the archive
    
}

