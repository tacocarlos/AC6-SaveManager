import { dialog, invoke } from '@tauri-apps/api';
import { AppConfig, CONFIG_FILE_PATH } from '@src/data/AppConfig';
import modalStyles from './settings-modal.module.css';
import Modal from 'react-modal';
import { Logger, isDir } from '@util';

import { message } from '@tauri-apps/api/dialog';
import { AC6ROAMING, DOCUMENTS_DIR } from '@src/data/constants/constant';
import { useSettings, useSettingsUpdate } from '@context/SettingsContext';

import { Button } from '@ui/button';

// TODO: actually do type checking on event handlers
export default function SettingsModal(props: {
    isOpen: boolean;
    modalClose: any;
    closeButtonHandler: any;
}) {
    // ignore these, they're just so that we can trigger a re render and I know it's bad
    // and we should just use useState
    const config = useSettings();
    const setConfig = useSettingsUpdate();

    const archivePaths = config.archive_paths;
    const saveLoc = config.save_loc;
    const exePath = config.exec_path;

    function setExePath(selected: string) {
        const newConfig = AppConfig.default();
        newConfig.archive_paths = config.archive_paths;
        newConfig.save_loc = config.save_loc;
        newConfig.exec_path = selected;
        setConfig(newConfig);
    }

    function setArchivePaths(paths: string[]) {
        const newConfig = AppConfig.default();
        newConfig.archive_paths = paths;
        newConfig.save_loc = config.save_loc;
        newConfig.exec_path = config.exec_path;
        setConfig(newConfig);
    }

    function setSaveLoc(saveLoc: string) {
        const newConfig = AppConfig.default();
        newConfig.archive_paths = config.archive_paths;
        newConfig.save_loc = saveLoc;
        newConfig.exec_path = config.exec_path;
        setConfig(newConfig);
    }

    async function changeExecPath() {
        const default_path = (await invoke('get_game_path')) as string;
        const selected = await dialog.open({
            defaultPath: default_path,
            multiple: false,
            filters: [
                {
                    name: 'Executables',
                    extensions: ['exe'],
                },
                {
                    name: 'Any',
                    extensions: ['*'],
                },
            ],
        });

        if (selected == null || Array.isArray(selected)) {
            Logger.trace('Invalid selection for exec path');
            return;
        }

        try {
            await config.set_executable_path(selected);
            Logger.info(`Set ${selected} as executable path`);
            setExePath(selected);
        } catch (reason: any) {
            if (reason instanceof Error) {
                Logger.error(reason.message);
            } else {
                console.log(reason);
            }
        }
    }

    async function saveSettings() {
        try {
            await config.saveConfig();
            Logger.trace(
                `Saved settings to ${CONFIG_FILE_PATH}.\n${config.stringify()}`
            );
        } catch (reason: any) {
            Logger.error(reason);
            await message('Failed to save settings.');
        }
    }

    async function removeArchivePath(ap: string) {
        const confirmResult = await dialog.confirm(
            'Are you sure you want to remove\n' +
                ap +
                '\nfrom the list of paths containing archives?'
        );
        if (!confirmResult) {
            return;
        }

        Logger.trace(`Attempting to remove \`${ap}\` from paths...`);
        config.remove_path(ap);
        setArchivePaths(archivePaths.filter((p) => p !== ap));
    }

    async function addArchivePath() {
        const selected = await dialog.open({
            defaultPath: DOCUMENTS_DIR,
            multiple: false,
            directory: true,
        });

        if (!selected || Array.isArray(selected)) {
            Logger.trace('Invalid archive path selection');
            return;
        }

        if (!config.add_path(selected)) {
            await dialog.message('Archive path is already selected');
            return;
        }

        setArchivePaths([...archivePaths, selected]);
    }

    async function changeSaveLocation() {
        const defaultPath = (await isDir(AC6ROAMING))
            ? AC6ROAMING
            : DOCUMENTS_DIR;
        const selected = await dialog.open({
            defaultPath: defaultPath,
            multiple: false,
        });

        if (!selected || Array.isArray(selected)) {
            Logger.error('Invalid save location selection');
            return;
        }

        try {
            await config.set_save_path(selected);
            setSaveLoc(selected);
            return;
        } catch (reason: any) {
            if (reason instanceof Error) {
                Logger.error(reason.message);
            } else {
                console.log(reason);
            }

            await dialog.message('Invalid save location selection', {
                type: 'warning',
            });
        }
    }

    const archivePathsContent = archivePaths.map((ap) => {
        const ButtonContent = (
            <Button
                className={`${modalStyles.removeArchivePathButton}`}
                onClick={() => removeArchivePath(ap)}>
                Remove Archive Path
            </Button>
        );

        return (
            <li
                key={ap}
                className={`${modalStyles.archivePathItem} ${modalStyles.itemWrapper}`}>
                <div className={`${modalStyles.archivePath}`}>{ap}</div>
                {ap !== AppConfig.defaultArchiveLocation ? ButtonContent : null}
            </li>
        );
    });

    return (
        <Modal
            isOpen={props.isOpen}
            onRequestClose={props.modalClose}
            className={modalStyles.modalStyle}
            ariaHideApp={false}>
            {/* <h1 className={`${modalStyles.titleHeader}`}> */}
            <h1 className="relative left-0 text-left text-3xl font-semibold text-white">
                Armored Core 6 Save Manager Settings
            </h1>
            <br />
            <div
                className={`${modalStyles.sectionWrapper} ${modalStyles.execSection}`}>
                <h2 className={`${modalStyles.archivePathHeader}`}>
                    Executable Path
                </h2>
                <div>
                    <span
                        className={`${modalStyles.itemWrapper} ${modalStyles.execPath}`}>
                        {exePath}
                    </span>
                    <Button
                        onClick={changeExecPath}
                        style={{ marginRight: '10px' }}>
                        Change Executable Path
                    </Button>

                    <Button
                        onClick={() => {
                            config.clear_path();
                        }}>
                        Clear Executable Path
                    </Button>
                </div>
            </div>

            <div
                className={`${modalStyles.archivePathListSection} ${modalStyles.sectionWrapper}`}>
                <h2 className={`${modalStyles.archivePathHeader}`}>
                    Archive Paths
                </h2>
                <ul className={`${modalStyles.archivePathList}`}>
                    {archivePathsContent}
                </ul>
                <Button onClick={addArchivePath}>
                    {' '}
                    Add Archive Search Directory
                </Button>
            </div>

            <div className={modalStyles.sectionWrapper}>
                <h2>Save File Location</h2>
                <br />
                <span className={`${modalStyles.itemWrapper}`}>{saveLoc}</span>
                <br />
                <Button
                    onClick={changeSaveLocation}
                    style={{ marginTop: '10px' }}>
                    Change Save File Location
                </Button>
            </div>

            <br />
            <div>
                <Button
                    onClick={props.closeButtonHandler}
                    style={{ marginRight: '10px' }}>
                    Close
                </Button>
                <Button onClick={saveSettings}>Save Settings</Button>
            </div>
        </Modal>
    );
}
