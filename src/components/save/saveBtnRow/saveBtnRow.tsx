import { useSelectedArchive, useSelectedSave } from '@context/SelectedContext';
import styles from './saveBtnRow.module.css';
import { SRButton } from './srbutton/SRButton';
import { useManager, useManagerUpdate } from '@src/context/ArchiveContext';
import {
    useSetNewSaveModalType,
    useShowNewSaveModal,
} from '@src/context/modal-context/NewSaveContext';
import { SaveDataFile } from '@src/data/save-data/SaveDataFile';
import { useSettings } from '@context/SettingsContext';
import { Logger, openInExplorer } from '@src/util';
import { dialog } from '@tauri-apps/api';
import { SaveData } from '@src/data/save-data/save';
import { FolderArchive } from '@src/data/archive/folder_archive';
import { useToast } from '@ui/use-toast';

export function SaveRowButtons() {
    const selectedSave = useSelectedSave();
    const archiveID = useSelectedArchive();
    const manager = useManager();
    const setMager = useManagerUpdate();
    const archive = manager.getArchive(archiveID);
    const config = useSettings();
    const { toast } = useToast();

    const showNewSaveModal = useShowNewSaveModal();
    const setNewSaveModalType = useSetNewSaveModalType();

    function showBackup() {
        setNewSaveModalType('backup');
        showNewSaveModal();
    }

    async function updateSave() {
        if (
            archive === undefined ||
            selectedSave === undefined ||
            !archive.hasSave(selectedSave)
        ) {
            return;
        }

        if (
            (await dialog.confirm(
                'Are you sure you want to update the backed up save?',
                { title: 'Update Save Backup', type: 'warning' }
            )) === false
        ) {
            return;
        }

        const save = archive.getSave(selectedSave) as SaveData;
        save.writeSave();
    }

    async function deleteSave() {
        if (
            archive === undefined ||
            selectedSave === undefined ||
            !archive.hasSave(selectedSave)
        ) {
            return;
        }

        const save = archive.getSave(selectedSave) as SaveData;

        if (
            (await dialog.confirm(
                `Are you sure you want to delete ${save.getMetadata().getName()}?`
            )) === false
        ) {
            return;
        }
        (archive as FolderArchive).deleteSave(save.getMetadata().getID());

        setMager(manager.shallowClone());
    }

    async function installSave() {
        const s = archive?.getSave(selectedSave ?? '');
        if (selectedSave === undefined || s === undefined) {
            Logger.error('Attempted to install an unselected save.');
            return;
        }

        if (
            (await dialog.confirm('Overwrite installed save?', {
                title: 'Install Save',
                type: 'warning',
            })) === false
        ) {
            return;
        }

        const saveFile = s as SaveDataFile;
        try {
            await saveFile.setSaveActive(config);
            await dialog.message('Successfully set save.');
        } catch (reason: any) {
            if (reason instanceof Error) {
                Logger.error(reason.message);
            } else {
                console.log(`Failed to install save file.\n${reason}`);
            }
        }
    }

    function openSave() {
        const save = archive?.getSave(selectedSave ?? '');
        if (save === undefined) {
            return;
        }
        const filePath = (save as SaveDataFile).getFilePath();
        openInExplorer(filePath);
    }

    const haveArchive = archiveID !== undefined;
    const haveSave = selectedSave !== undefined;

    return (
        <div className={`${styles.btnBanner}`}>
            <SRButton action={showBackup} active={haveArchive}>
                <span>Backup Installed Save</span>
            </SRButton>
            <SRButton action={installSave} active={haveSave}>
                <span>Install Save</span>
            </SRButton>
            <SRButton action={updateSave} active={haveSave}>
                <span>Update Save</span>
            </SRButton>
            <SRButton action={deleteSave} active={haveSave}>
                <span>Delete Save</span>
            </SRButton>
            <SRButton action={openSave} active={haveSave}>
                <span>Open Containing Save Folder</span>
            </SRButton>
        </div>
    );
}
