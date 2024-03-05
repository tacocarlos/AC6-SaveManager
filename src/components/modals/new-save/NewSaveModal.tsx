import { useManager } from "@src/context/ArchiveContext";
import { useSelectedArchive, useSelectedSaveUpdate } from "@src/context/SelectedContext";
import { useSettings } from "@src/context/SettingsContext";
import { FolderArchive } from "@src/data/archive/folder_archive";
import { SAVE_NAME } from "@src/data/constants/constant";
import { SaveDataFile } from "@src/data/save-data/SaveDataFile";
import { SaveDataFileMetadata } from "@src/data/save-data/SaveDataFileMetadata";
import { Logger } from "@src/util";
import { createDir, copyFile } from "@tauri-apps/api/fs";
import { join } from "@tauri-apps/api/path";
import { useState, useRef } from "react";
import Modal from 'react-modal';

import defaultStyles from "../modalStyles.module.css";
import modalStyles  from "./NewSaveModal.module.css";


export type NewSaveType = 'unselected' | 'backup' | 'blank' | 'import';

export default function NewSaveModal({isOpen, closeModal, newSaveType}: {isOpen: boolean, closeModal: () => void, newSaveType: NewSaveType}) {
    const settings = useSettings();
    const manager = useManager();
    const archiveID = useSelectedArchive();

    const setSelectedSave = useSelectedSaveUpdate();

    const saveID = manager.get_new_SaveID();
    const [metadata, setMetadata] = useState(SaveDataFileMetadata.defaultVanillaMetadata(saveID))
    const [name, setName] = useState(metadata.getName());
    const [note, setNote] = useState(metadata.getNotes());
    
    const nameRef = useRef<HTMLInputElement>(null);
    const noteRef = useRef<HTMLTextAreaElement>(null);

    const archive = manager.getArchive(archiveID);
    if(archive === undefined || newSaveType === 'unselected') {
        closeModal();
        return <></>;
    }
    
    const sourceFile = newSaveType === 'backup' ? settings.get_save_path() : "../../../defaults/TEST_SAVE.sl2";
    
    async function createNewSave(sourcePath: string) {
        if(archive === undefined) {
            return; // have no archive to store to
        }

        const folderArchive = archive as FolderArchive;
        const saveFolder = await join(await folderArchive.getArchivePath(), metadata.getName() + "--" + metadata.getID());
        const savePath = await join(saveFolder, SAVE_NAME);
        // const dataPath = await join(saveFolder, SAVE_NAME);
        const mdPath = await join(saveFolder, SaveDataFileMetadata.SaveMetadataFileName);

        // need to create the save folder
        await createDir(saveFolder);
        const save = new SaveDataFile(metadata, savePath);        
        save.metadataPath = mdPath;        

        while(!archive.addSave(save)) {
            save.getMetadata().setID(manager.get_new_SaveID());
        }

        await save.writeSave();
        await copyFile(sourcePath, savePath);
        setSelectedSave(save.getSaveID());
        closeModal();
    }
    
    function newSaveSubmit(submitEvent: React.FormEvent<HTMLFormElement>) {
        submitEvent.preventDefault();
    }

    function nameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if(event.key === "Enter") {
            event.preventDefault();
            Logger.trace("Prevented Enter on name field");
        }
    }

    function onNameChange(change: React.ChangeEvent<HTMLInputElement>) {
        change.preventDefault();
        if(nameRef.current) {
            const newName = nameRef.current.value;
            setName(newName);
            setMetadata(curr => {
                const next = SaveDataFileMetadata.defaultVanillaMetadata(curr.getID());
                next.updateLMDate();
                next.setNotes(note);
                next.setName(newName);
                return next;
            })
        }
    }

    function onNoteChange(change: React.ChangeEvent<HTMLTextAreaElement>) {
        change.preventDefault();
        if(noteRef.current) {
            const newNote = noteRef.current.value;
            setNote(newNote);
            setMetadata(curr => {
                const next = SaveDataFileMetadata.defaultVanillaMetadata(curr.getID());
                next.updateLMDate();
                next.setName(name);
                next.setNotes(newNote);
                return next;
            })
        }
    }
    
    // e.g., .../<archive>/<name-ID>/{AC60000.sl2, savemetadata.json}
    
    const title = newSaveType === 'backup' ? "Backup Currently Installed Save File" : "Create Blank Save File";
    return <Modal isOpen={isOpen} onRequestClose={closeModal} ariaHideApp={false} className={defaultStyles.modalStyle}>
        <h1 className={defaultStyles.titleHeader}>{title}</h1>
        <br/>
        <form onSubmit={newSaveSubmit} className={defaultStyles.sectionWrapper}>
            <label className={modalStyles.nameLabel}>
                Save Name
                <input className={modalStyles.nameInput} ref={nameRef} onSubmit={(e) => {e.preventDefault();}} onKeyDown={nameKeyDown} onChange={onNameChange} placeholder="Save Name" value={name}/>
            </label>
            <br/> <br/>
            <label className={modalStyles.notesLabel}>
                Save Notes
                <br/>
                <textarea className={modalStyles.notesArea} ref={noteRef} onChange={onNoteChange} value={note} wrap='soft' placeholder="Notes for save data"/>
            </label>
            <br/>
            <button onClick={() => createNewSave(sourceFile)} type='submit'>Create New Save</button>
        </form>
    </Modal>    
}