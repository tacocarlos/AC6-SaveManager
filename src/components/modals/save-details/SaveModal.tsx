import { useRef, useState } from 'react';

import Modal from 'react-modal';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import {
    useSelectedArchive,
    useSelectedSave,
} from '@src/context/SelectedContext';
import { useManager } from '@src/context/ArchiveContext';

import modalStyles from './SaveModal.module.css';
import { SaveDataFile } from '@src/data/save-data/SaveDataFile';
import { Logger } from '@util';

type ModalType = 'editable' | 'viewable';
type ModalTypeToggle = () => void;

import './SaveModalStyles.css';
import { Button } from '@ui/button';
import PathView from '@src/components/PathView';

function EditableSaveModal({
    save,
    typeToggle,
    closeHandler,
}: {
    save: SaveDataFile;
    typeToggle: ModalTypeToggle;
    closeHandler: any;
}) {
    const nameRef = useRef<HTMLInputElement>(null);
    const noteRef = useRef<HTMLTextAreaElement>(null);

    const [name, setName] = useState(save.getMetadata().getName());
    const [note, setNote] = useState(save.getMetadata().getNotes());

    async function writeSaveFile(submitEvent: any) {
        submitEvent.preventDefault();
        // Save the currrent save metadata
        Logger.info('Saved data file: ' + (await save.getMetadataPath()));
        save.getMetadata().setName(name);
        save.getMetadata().setNotes(note);
        save.getMetadata().updateLMDate();
        try {
            await save.writeSave();
        } catch (reason) {
            if (reason instanceof Error) {
                Logger.error(reason.message);
            } else {
                console.log(reason);
            }
        }

        typeToggle();
    }

    function nameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            event.preventDefault();
            Logger.trace('Prevented Enter on name field');
        }
    }

    function onNameChange(change: React.ChangeEvent<HTMLInputElement>) {
        change.preventDefault();
        if (nameRef.current) {
            setName(nameRef.current.value);
        }
    }

    function onNoteChange(change: React.ChangeEvent<HTMLTextAreaElement>) {
        change.preventDefault();
        if (noteRef.current) {
            setNote(noteRef.current.value);
        }
    }

    return (
        <>
            <p className="text-3xl">Edit Save File</p>
            <br />
            <form onSubmit={writeSaveFile} id="editSaveForm">
                <label>
                    <span>Save Name </span>
                    <input
                        className="pl-1 font-semibold text-black"
                        ref={nameRef}
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                        onKeyDown={nameKeyDown}
                        onChange={onNameChange}
                        placeholder="Archive Name"
                        value={name}
                        type="text"
                    />
                </label>
                <br />
                <label>
                    {'Last Modified Date: '}
                    <span>{save.getMetadata().getLMDate().toString()}</span>
                </label>
                <br /> <br />
                <label>
                    <p>Save Notes</p>
                    <div className={modalStyles.notesBorder}>
                        <textarea
                            ref={noteRef}
                            onChange={onNoteChange}
                            value={note}
                            className={modalStyles.notesEdit}
                            wrap="soft"
                            placeholder="Notes for save data"
                        />
                    </div>
                </label>
                <br />
                <div className="flex space-x-5">
                    <Button
                        onClick={writeSaveFile}
                        type="submit"
                        className="hover:bg-green-700">
                        Apply Changes
                    </Button>
                    <Button onClick={typeToggle}>Cancel</Button>
                    <Button onClick={closeHandler}>Close</Button>
                </div>
            </form>
        </>
    );
}

function ViewableSaveModal({
    save,
    typeToggle,
    closeHandler,
}: {
    save: SaveDataFile;
    typeToggle: ModalTypeToggle;
    closeHandler: any;
}) {
    const saveFilePath = save.getFilePath();
    return (
        <div className="flex flex-col space-y-3">
            {/* <h1 className={modalStyles.viewHeader + ' text-3xl'}> */}
            <p className="self-start text-3xl">
                {save.getMetadata().getName()}
            </p>
            <br />
            <label>
                {'Date Last Modified: '}
                <span>{save.getMetadata().getLMDate().toString()}</span>
            </label>
            <label className="flex space-x-3">
                <span>{'Save File Path: '}</span>
                <PathView filePath={saveFilePath} isFile />
            </label>

            <Markdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[]}
                className={modalStyles.notes}>
                {save.getMetadata().getNotes()}
            </Markdown>
            <br />
            <div className="flex w-full space-x-5">
                <Button onClick={typeToggle}>Edit Save</Button>
                <Button onClick={closeHandler}>Close</Button>
            </div>
        </div>
    );
}

export default function SaveModal({
    isOpen,
    modalClose,
}: {
    isOpen: boolean;
    modalClose: any;
}) {
    const [modalType, setModalType] = useState<ModalType>('viewable');
    const setEditable = () => setModalType('editable');
    const setViewable = () => setModalType('viewable');

    const saveID = useSelectedSave();
    const archiveID = useSelectedArchive();
    const manager = useManager();

    if (saveID === undefined || archiveID === undefined) {
        Logger.error(
            `Attempted to open SaveModal when a save id (or archive id) was undefined\nSaveID: ${saveID}\t ArchiveID: ${archiveID}`
        );
        return <></>;
    }

    const archive = manager.getArchive(archiveID);
    const save = archive?.getSave(saveID) as SaveDataFile;

    if (save === undefined) return <></>;

    function closeHandler() {
        setViewable();
        modalClose();
    }

    return (
        <Modal
            ariaHideApp={false}
            isOpen={isOpen}
            onRequestClose={closeHandler}
            // className={modalStyles.modal}
            className="mx-10 mt-[calc(100vh-50%)] bg-maroon p-6 text-primary-foreground"
            // overlayClassName={modalStyles.modalOverlay}
            id="SaveModal">
            <div className="flex w-full flex-col">
                {modalType === 'editable' ? (
                    <EditableSaveModal
                        save={save}
                        typeToggle={setViewable}
                        closeHandler={closeHandler}
                    />
                ) : (
                    <ViewableSaveModal
                        save={save}
                        typeToggle={setEditable}
                        closeHandler={closeHandler}
                    />
                )}
            </div>
        </Modal>
    );
}
