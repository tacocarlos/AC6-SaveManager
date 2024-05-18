import { useEffect, useState } from 'react';
import AppHeader from './components/app-header/header';
import { Logger } from '@util';
import ArchiveViewer from './components/archive/window/ArchiveViewer';
import { SaveViewer } from '@components/save/SaveViewer';
import { useSelectedArchive } from '@context/SelectedContext';
import { useManager, useManagerUpdate } from '@context/ArchiveContext';
import { ButtonBar } from './components/app-buttons/ButtonBar';
import { useSettings } from '@context/SettingsContext';

import { dialog } from '@tauri-apps/api';
import { Toaster } from '@ui/toaster';
import { useToast } from '@ui/use-toast';

export function App() {
    const manager = useManager();
    const setManager = useManagerUpdate();
    const selectedArchive = useSelectedArchive();
    const settings = useSettings();

    const { toast } = useToast();

    const [refresh, setRefresh] = useState<boolean>(false);
    const forceRefresh = () => {
        setManager(manager.shallowClone());
        setRefresh(!refresh);
    };

    // On initial load and whenever the manager changes, re read the archive paths
    useEffect(() => {
        manager.clearArchives();
        manager
            .discoverArchives(settings)
            .then(() => {
                Logger.info('Found saves');
                forceRefresh();
                toast({
                    description: `Found ${manager.archives.size} archives`,
                });
            })
            .catch(() => {
                Logger.error('Failed to discover archives');
                dialog.message('Failed to load archives from config.', {
                    type: 'error',
                    title: 'Archive discovery failure',
                });
            });
    }, [settings.archive_paths]);

    return (
        <div className="flex h-screen flex-col overflow-y-hidden">
            <AppHeader />
            <ButtonBar />
            <div className=" grid h-[calc(100vh-120px)] grid-cols-[250px_calc(100vw-259px)] gap-2 bg-primary">
                <ArchiveViewer />
                {/* <div className="h-full w-full overflow-y-auto overflow-x-hidden"> */}
                <div className="h-full w-full">
                    <SaveViewer key={selectedArchive} />
                </div>
            </div>
            <Toaster />
        </div>
    );
}
