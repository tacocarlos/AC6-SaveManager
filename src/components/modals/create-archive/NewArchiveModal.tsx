import { useManager, useManagerUpdate } from '@src/context/ArchiveContext';
import { useSettings } from '@src/context/SettingsContext';
import { DEFUALT_ARCHIVE_NAME } from '@src/data/AppConfig';
import { dialog } from '@tauri-apps/api';
import { Logger } from '@util';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';

import defaultStyles from '../modalStyles.module.css';
import modalStyles from './NewArchiveModal.module.css';
import { Button } from '@src/components/ui/button';

export default function NewArchiveModal({
    isOpen,
    modalClose,
    closeButtonHandler,
}: {
    isOpen: boolean;
    modalClose: any;
    closeButtonHandler: any;
}) {
    const settings = useSettings();
    const manager = useManager();
    const setManager = useManagerUpdate();

    const [selectedArchivePath, setArchivePath] = useState(
        settings.archive_paths[0]
    );
    const [archiveName, setArchiveName] = useState(DEFUALT_ARCHIVE_NAME);

    useEffect(() => {
        Logger.info(`Currently selected archive path: ${selectedArchivePath}`);
        Logger.info(`Archive Name: ${archiveName}`);
    });

    async function createArchive() {
        try {
            await manager.createFolderArchive(selectedArchivePath, archiveName);
            setManager(manager.shallowClone());
        } catch (reason: any) {
            if (reason instanceof Error) {
                Logger.error(reason.message);
            } else {
                console.log(reason);
            }

            await dialog.message('Failed to create archive.', {
                type: 'error',
                title: 'Archive Creation Failure',
            });
        }
        modalClose(); // updates the manager since it changes the state in `App`
    }

    const pathOptions = settings.archive_paths.map((archivePath) => {
        return (
            <option key={archivePath} value={archivePath}>
                {archivePath}
            </option>
        );
    });

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={modalClose}
            ariaHideApp={false}
            className={defaultStyles.modalStyle}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                }}
                className={defaultStyles.sectionWrapper}>
                <label className={`${modalStyles.pathLabel} text-white`}>
                    Select Archive Path:
                    <select
                        className={modalStyles.pathSelect}
                        name="Archive Path Selector"
                        onChange={(e) => {
                            e.preventDefault();
                            Logger.trace(`Selected ${e.currentTarget.value}`);
                            setArchivePath(e.currentTarget.value);
                        }}>
                        {pathOptions}
                    </select>
                </label>
                <br /> <br />
                <label className={modalStyles.archiveLabel + ' text-white'}>
                    Archive Name:
                    <input
                        className={
                            modalStyles.archiveNameInput +
                            ' rounded-xl border text-black '
                        }
                        placeholder="Archive Name"
                        defaultValue={DEFUALT_ARCHIVE_NAME}
                        onChange={(e) => {
                            setArchiveName(e.currentTarget.value);
                        }}
                    />
                </label>
            </form>

            <span className="flex space-x-2">
                <Button onClick={createArchive}>Create Archive</Button>
                <Button onClick={closeButtonHandler}>Close</Button>
            </span>
        </Modal>
    );
}
