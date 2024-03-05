import { useSelectedArchive, useSelectedSave } from "@context/SelectedContext";
import styles from "./saveBtnRow.module.css";
import { SRButton } from "./srbutton/SRButton";
import { useManager } from "@src/context/ArchiveContext";
import { useSetNewSaveModalType, useShowNewSaveModal } from "@src/context/modal-context/NewSaveContext";
import { SaveDataFile } from "@src/data/save-data/SaveDataFile";
import { useSettings } from "@context/SettingsContext";
import { Logger } from "@src/util";
import { dialog } from "@tauri-apps/api";

export function SaveRowButtons() {
    const selectedSave = useSelectedSave();
    const archiveID = useSelectedArchive();
    const manager = useManager();
    const archive = manager.getArchive(archiveID);
    const config = useSettings();


    const showNewSaveModal = useShowNewSaveModal();
    const setNewSaveModalType = useSetNewSaveModalType();

    function showBackup() {
        setNewSaveModalType('backup');
        showNewSaveModal();
    }

    // Since game asks for pilot name on file creation, don't think I can really provide a blank save
    
    // function showBlank() {
    //     setNewSaveModalType('blank');
    //     closeNewSaveModal();
    // }

    async function installSave() {
        const s = archive?.getSave(selectedSave ?? "");
        if(selectedSave === undefined || s === undefined) {            
            Logger.error("Attempted to install an unselected save.");
            return;
        }

        const saveFile = s as SaveDataFile;
        try {
            await saveFile.setSaveActive(config);
            await dialog.message("Successfully set save.");
        } catch(reason: any) {
            if(reason instanceof Error) {
                Logger.error(reason.message);
            } else {
                console.log(`Failed to install save file.\n${reason}`);
            }
        }
    }

    // todo: add a way to reliably get a 'blank' save file (just created)
    return (
        <div className={`${styles.btnBanner}`}>
            <SRButton action={showBackup} active={archiveID !== undefined}><span>Backup Installed Save</span></SRButton>
            {/* <SRButton action={showBlank} active={activeStatus}><span>Create Blank Save</span></SRButton> */}
            <SRButton action={installSave} active={selectedSave !== undefined}><span>Install Save</span></SRButton>
        </div>
    );
}