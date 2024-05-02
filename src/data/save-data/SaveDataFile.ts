import { Logger, copy, isFile } from "@util";
import { AppConfig } from "../AppConfig";
import { SaveData, SaveMetadata } from "./save";

import { exists, removeFile, writeFile, writeTextFile } from "@tauri-apps/api/fs"

import { ARCHIVE_METADATA_NAME, SAVE_NAME, TEMP_SAVE_LOC } from "../constants/constant";
import { message } from "@tauri-apps/api/dialog";
import { ItemID } from "../ItemID";
import { SaveDataFileMetadata } from "./SaveDataFileMetadata";
import { basename, dirname, join } from "@tauri-apps/api/path";
import { dialog } from "@tauri-apps/api";

export class SaveDataFile implements SaveData {
    metadata: SaveDataFileMetadata;
    savePath: string;
    metadataPath?: string;

    constructor(meta: SaveDataFileMetadata, savePath: string) {
        this.metadata = meta;
        this.savePath = savePath; // should store the path to the actual .sl2 file
    }

    static async createValidSaveFile(meta: SaveDataFileMetadata, savePath: string): Promise<SaveDataFile> {
        const save = new SaveDataFile(meta, savePath);
        try {
            await save.validateSave();
            return Promise.resolve(save);
        } catch(reason: any) {
            if(reason instanceof Error) {
                Logger.error(reason.message);
            } else {
                console.log(reason);
            }
            return Promise.reject();
        }
    }

    getSaveID(): ItemID {
        return this.metadata.getID();
    }

    getMetadata(): SaveMetadata {
        return this.metadata;
    }

    getFilePath() {
        return this.savePath;
    }   

    async getMetadataPath() {
        return await join(await dirname(this.getFilePath()), ARCHIVE_METADATA_NAME);
    }

    async validateSave(): Promise<boolean> {
        return Promise.resolve(await isFile(this.savePath));
    }

    /** 
     * @deprecated 
     */
    private async backup_temp(config: AppConfig) {
        return this.backupTemp(config.get_save_path());
    }

    private async backupTemp(sourcePath: string) {
        const sourceExists = await exists(sourcePath);
        if(!sourceExists) {
            return Promise.reject();
        }

        if(!await copy(sourcePath, TEMP_SAVE_LOC, true)) {
            return Promise.reject();
        }

        return Promise.resolve();

    }

    /**
     * @deprecated
     */
    private async restore_temp(config: AppConfig) {
        return this.restoreTemp(config.get_save_path());
    }

    private async restoreTemp(destPath: string) {
        if(!await copy(TEMP_SAVE_LOC, destPath, true)) {
            return Promise.reject();
        }

        return Promise.resolve();
    }

    // Don't really care if we successfully delete the temp file -- will overwrite it next time
    private async deleteTemp() {
        if(await exists(TEMP_SAVE_LOC)) {
            await removeFile(TEMP_SAVE_LOC);
        }

        return Promise.resolve();
    }

    // sets `this` as the active save file
    // overwrites current placed save
    async setSaveActive(config: AppConfig): Promise<void> {
        if(!this.validateSave()) {
            Logger.error("Save validation failed during install: " + this.getFilePath())
            return Promise.reject();
        }



        // first, store the current save file in a temp dir if it exists
        const destPath = config.get_save_path();
        let originalSaveExists = false;
        if(await exists(destPath)) {
            originalSaveExists = true;
            try {
                await this.backup_temp(config);
            } catch(reason: any) {
                message("Failed to backup currently active save.\nWill not attempt to swap save files.")
            }
        }


        try {
            await removeFile(destPath);
            const removeStatus = await exists(destPath);
            if(removeStatus == true) {
                throw new Error("Failed to delete original save");
            }

            const copyStatus = await copy(this.getFilePath(), destPath, true);
            if(copyStatus !== true) {
                throw new Error("Failed to copy file");
            }
        } catch (reason: any) {
            if(originalSaveExists) {
                this.restore_temp(config).catch( () => {
                    const err_msg = `Failed to restore backup save file. It can be found at\n${TEMP_SAVE_LOC}\nBe warned that attempting to set the save file might cause save data corruption.`;
                    message(err_msg);
                });
            }

            return Promise.reject();
        }

        if(originalSaveExists) {
            this.deleteTemp().catch(); // don't really care if deleting the temp save worked or not (will be overwritten next time)
        }

        return Promise.resolve();
    }

    async setMetadataPath() {
        // extracts md path from savePath
        const dir = await dirname(this.savePath);
        const mdPath = await join(dir, SaveDataFileMetadata.SaveMetadataFileName);
        if(!await isFile(mdPath)) {
            return Promise.reject();
        }

        this.metadataPath = mdPath;
        return Promise.resolve();
    }

    async writeSave(): Promise<void> {
        const mdPath = this.metadataPath;
        if(mdPath === undefined) {
            try {
                await this.setMetadataPath();
            } catch(reason: any) {
                console.log(reason);
                return Promise.reject();
            }
        }

        Logger.trace(this.metadataPath as string);
        try {
            await writeTextFile(mdPath as string, JSON.stringify(this.getMetadata(), null, '\t'));
            return Promise.resolve();
        } catch(reason) {
            return Promise.reject();
        }
    }

    async updateSave(config: AppConfig, sourceDataFile?: string): Promise<void> {
        if(sourceDataFile === undefined) {
            if(!config.has_save_path()) {
                return Promise.reject();
            }

            sourceDataFile = config.get_save_path();
        }

        if(await basename(sourceDataFile) !== SAVE_NAME || await !isFile(sourceDataFile)) {
            return Promise.reject();
        }

        /** Steps for updating a save:
         *      1) backup this current save
         *      2) overwrite save with the source
         *          a) If fail, revert save
         */
        this.backupTemp(this.getFilePath());
        await copy(sourceDataFile, this.getFilePath()).then(() => {
            return Promise.resolve(); // successfully overwrote the save
        }).catch(async () => {
            // failed to overwrite the save
            return await this.restoreTemp(this.getFilePath());
        }).catch(() => {
            // failed to restore temp
            return dialog.message(`Save Data Failure. Could not restore the save data from temp.\n${TEMP_SAVE_LOC}`);
        });
    }

    async deleteSave(): Promise<void> {
        await removeFile(this.getFilePath());
        await removeFile(await this.getMetadataPath());
    }
}