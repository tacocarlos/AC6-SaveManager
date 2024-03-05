import { useRef, useState } from "react";

import Modal from "react-modal";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { useSelectedArchive, useSelectedSave } from "@src/context/SelectedContext";
import { useManager } from "@src/context/ArchiveContext";

import modalStyles from "./SaveModal.module.css";
import { SaveDataFile } from "@src/data/save-data/SaveDataFile";
import { Logger, openInExplorer } from "@util";

type ModalType = "editable" | "viewable";
type ModalTypeToggle = () => void;

import "./SaveModalStyles.css";

function EditableSaveModal({save, typeToggle} : {save: SaveDataFile, typeToggle: ModalTypeToggle}) {
    const nameRef = useRef<HTMLInputElement>(null);
    const noteRef = useRef<HTMLTextAreaElement>(null);

    const [name, setName] = useState(save.getMetadata().getName());
    const [note, setNote] = useState(save.getMetadata().getNotes());

    async function writeSaveFile(submitEvent: any) {
        submitEvent.preventDefault();
        // Save the currrent save metadata        
        Logger.info("Saved data file: " + await save.getMetadataPath());
        save.getMetadata().setName(name);
        save.getMetadata().setNotes(note);
        save.getMetadata().updateLMDate();
        try {
            await save.writeSave();
        } catch(reason) {
            if(reason instanceof Error) {
                Logger.error(reason.message);
            } else {
                console.log(reason);
            }
        }

        typeToggle();
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
            setName(nameRef.current.value);
        }
    }

    function onNoteChange(change: React.ChangeEvent<HTMLTextAreaElement>) {
        change.preventDefault();
        if(noteRef.current) {
            setNote(noteRef.current.value);
        }
    }

    return <>
        <h1>Edit Save File</h1>
        <br/> <br/>
        <form onSubmit={writeSaveFile} id="editSaveForm">
            <label>
                <span>Save Name </span>
                <input ref={nameRef} onSubmit={(e) => {e.preventDefault();}} onKeyDown={nameKeyDown} onChange={onNameChange} placeholder="Archive Name" value={name}/>
            </label>

            <br/>

            <label>
                {"Last Modified Date: "}
                <span>{save.getMetadata().getLMDate().toString()}</span>
            </label>

            <br/> <br/>

            <label>
                <p>Save Notes</p>
                <div className={modalStyles.notesBorder}>
                    <textarea ref={noteRef} onChange={onNoteChange} value={note} className={modalStyles.notesEdit} wrap='soft' placeholder="Notes for save data"/>
                </div>
            </label>

            <br/> <br/>
            <button onClick={writeSaveFile} type='submit'>Apply Changes</button>
        </form>
    </>
}

function ViewableSaveModal({save, typeToggle}: {save: SaveDataFile, typeToggle: ModalTypeToggle}) {
    return <>
        <h1 className={modalStyles.viewHeader}>{save.getMetadata().getName()}</h1>
        <br/><br/>
        <label>
            {"Date Last Modified: "}
            <span>{save.getMetadata().getLMDate().toString()}</span>
        </label>
        <br/>
        <label>
            <span>{"Save File Path: "}</span>
            <a onClick={() => {openInExplorer(save.getFilePath())}}>{save.getFilePath()}</a>
        </label>

        <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[]} className={modalStyles.notes}>
            {save.getMetadata().getNotes()}
        </Markdown>
        <br/>
        <button onClick={typeToggle}>Edit Save</button>
    </>
}


export default function SaveModal( {isOpen, modalClose} : {
    isOpen: boolean,
    modalClose: any,
}) {
    const [modalType, setModalType] = useState<ModalType>('viewable');
    const setEditable = () => setModalType('editable');
    const setViewable = () => setModalType('viewable');

    const saveID = useSelectedSave();
    const archiveID = useSelectedArchive();
    const manager = useManager();

    if(saveID === undefined || archiveID === undefined) {
        return <></>;
    }

    const archive = manager.getArchive(archiveID);
    const save = archive?.getSave(saveID) as SaveDataFile;

    if(save === undefined) return <></>;

    // TODO: Have edit button to switch between <Markdown> and <input>

    
    function closeHandler() {
        setViewable();
        modalClose();   
    }

    return <Modal ariaHideApp={false}
        isOpen={isOpen} onRequestClose={closeHandler} 
        className={modalStyles.modal} overlayClassName={modalStyles.modalOverlay}>
        {        
            modalType === 'editable' ? 
                <EditableSaveModal save={save} typeToggle={setViewable}/> 
                : 
                <ViewableSaveModal save={save} typeToggle={setEditable}/>
        }
    </Modal>
}