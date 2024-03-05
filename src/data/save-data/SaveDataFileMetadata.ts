import { basename } from "@tauri-apps/api/path";
import { Logger } from "../../util";
import { ItemID } from "../ItemID";
import { SaveMetadata } from "./save";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";


export class SaveDataFileMetadata implements SaveMetadata {
    // save metadata must be this in order to load
    static SaveMetadataFileName = "AC6SM-SaveMetadata.json"
    
    id: ItemID;
    dateModified: Date;
    saveName: string;
    isModded: Boolean = false;
    notes: string;
    
    
    constructor(id: string, dateModified: Date, saveName: string, isModded: Boolean, notes: string) {
        this.id = id;
        this.dateModified = dateModified;
        this.saveName = saveName;
        this.isModded = isModded;
        this.notes = notes;
    }
    
    setID(id: ItemID) { this.id = id; }
    getID() { return this.id; }
    getName() { return this.saveName; }
    setName(name: string) {this.saveName = name;}
    
    static defaultVanillaMetadata(id: string) {
        return new SaveDataFileMetadata(id, new Date(Date.now()), "Armored Core 6 Save File", false, "");
    }
    
    static defaultModdedMetadata(id: string) {
        return new SaveDataFileMetadata(id, new Date(Date.now()), "Armored Core 6 Save File", true, "");
    }
    
    stringify(): string {
        return JSON.stringify(this, null, '\t');
    }

    static async fromFile(filePath: string): Promise<SaveDataFileMetadata> {
        const fileName = await basename(filePath);

        if(fileName !== this.SaveMetadataFileName) {
            Logger.error(`Given file path (${fileName} -- ${filePath}) did not match the specified file name`)
            return Promise.reject();
        }

        const fileContents = await readTextFile(filePath);
        const metadata = SaveDataFileMetadata.fromJson(fileContents);
        if(metadata === undefined) {
            Logger.error("file metadata failed to verify")
            return Promise.reject();
        }

        return Promise.resolve(metadata);
    }

    static fromJson(jsonData: string): SaveDataFileMetadata | undefined {
        let data = JSON.parse(jsonData);
        return SaveDataFileMetadata.verifyObject(data);
    }


    setNotes(content: string) {
        this.notes = content;
    }

    updateLMDate() {
        this.dateModified = new Date(Date.now());
    }

    getLMDate(): Date {
        return this.dateModified;
    }

    getNotes(): string {
        return this.notes;
    }

    private static verifyObject(data: any): SaveDataFileMetadata | undefined {
        if(!data.hasOwnProperty('id')) { 
            Logger.error("JSON data lacked an id");
            return undefined;
        }

        let md = this.defaultVanillaMetadata(data.id);
        if(data.hasOwnProperty('dateModified')) md.dateModified = data.dateModified;
        if(data.hasOwnProperty('saveName')) md.saveName = data.saveName;
        if(data.hasOwnProperty('isModded')) md.isModded = data.isModded;
        if(data.hasOwnProperty('notes')) md.notes = data.notes;        
        return md;
    }

    async saveJSON(filePath: string): Promise<void> {
        const json = JSON.stringify(this, null, '\t');
        return writeTextFile(filePath, json);        
    }
}