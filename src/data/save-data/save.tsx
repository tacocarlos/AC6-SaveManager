import { ItemID } from '../ItemID';
import { AppConfig } from '../AppConfig';


export interface SaveData {
    getMetadata(): SaveMetadata;
    setSaveActive(config: AppConfig): Promise<void>; // replaces AC60000.sl2, does not preserve preexising save
    writeSave(): Promise<void>;
    updateSave(config: AppConfig, sourceDataFile?: string): Promise<void>; // replaces the used AC60000.sl2 of the current save with the given one
}

export interface SaveMetadata {
    setID(id: ItemID): void;

    getID(): ItemID;
    getName(): string;
    setName(name: string): void;
    getLMDate(): Date;
    updateLMDate(): void;
    getNotes(): string;
    setNotes(content: string): void;
}