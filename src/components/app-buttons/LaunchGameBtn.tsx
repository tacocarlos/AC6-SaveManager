import { dialog } from '@tauri-apps/api';
import { Button } from '@ui/button';

import { useSettings } from '@src/context/SettingsContext';
import { Logger } from '@src/util';

import barStyles from './ButtonBar.module.css';

export default function LaunchGameButton() {
    const config = useSettings();

    async function launchGame() {
        Logger.trace('Attempting to launch the game');
        const exePath = config.get_executable_path();
        if (exePath === '') {
            Logger.warn('Exectuable path not set');
            await dialog.message(
                'Executable path was not set.\nPlease set it in the `Edit Config` menu.',
                {
                    title: 'Executable path not set',
                    type: 'warning',
                }
            );

            return;
        }

        Logger.trace(`Attemping to launch ${exePath}`);
        config.launch_game();
    }

    return (
        <>
            <Button
                className={barStyles.leftAligned + ' ' + barStyles.launchBtn}
                onClick={launchGame}>
                Launch Game
            </Button>
        </>
    );
}
