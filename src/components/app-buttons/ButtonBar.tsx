import { NewArchiveModalProvider } from '@src/context/modal-context/NewArchiveContext';
import { SettingsModalProvider } from '@src/context/modal-context/SettingsModalContext';
import EditConfigButton from './EditConfigBtn';
import LoadArchiveButton from './LoadArchiveBtn';
import LaunchGameButton from './LaunchGameBtn';
import DeleteArchiveButton from './DeleteArchiveBtn';
import NewArchiveButton from './NewArchiveBtn';
import OpenArchiveButton from './OpenArchiveBtn';

export function ButtonBar() {
    return (
        // <div className={`${barStyles.appBtnRow}`}>
        <div className="flex h-screen space-x-5 bg-[rgb(44,43,43)] p-2">
            {/* <span className={barStyles.rightAligned}> */}
            <LoadArchiveButton />
            <NewArchiveModalProvider>
                <NewArchiveButton />
            </NewArchiveModalProvider>
            <SettingsModalProvider>
                <EditConfigButton />
            </SettingsModalProvider>
            <DeleteArchiveButton />
            <OpenArchiveButton />
            <LaunchGameButton />
            {/* </span> */}
        </div>
    );
}
