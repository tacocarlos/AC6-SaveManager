import { useSelectedArchive } from '@src/context/SelectedContext';
import barStyles from './ButtonBar.module.css';
import { useManager } from '@src/context/ArchiveContext';
import { Logger, openInExplorer } from '@src/util';
import { FolderArchive } from '@src/data/archive/folder_archive';
import { dialog, path } from '@tauri-apps/api';
import { Button } from '@ui/button';
import { useToast } from '@ui/use-toast';

export default function OpenArchiveButton() {
    const archiveID = useSelectedArchive();
    const manager = useManager();
    const archive = manager.getArchive(archiveID);
    const { toast } = useToast();

    async function openArchive() {
        if (archive === undefined) {
            return;
        }

        const folderPath = (archive as FolderArchive).getArchivePath();
        Logger.info(folderPath);
        openInExplorer(folderPath)
            .then(() => {
                toast({
                    title: 'Show Archive',
                    description: `Opened \n${folderPath}\n in Explorer`,
                });
            })
            .catch(() => {
                toast({
                    variant: 'destructive',
                    title: 'Show Archive',
                    description: `Failed to open ${folderPath} in Explorer`,
                });
            });
    }

    return (
        <Button
            onClick={openArchive}
            className={`${barStyles.btn} ${archive !== undefined ? '' : barStyles.disabled}`}
            disabled={archive === undefined}>
            Show Archive
        </Button>
    );
}
