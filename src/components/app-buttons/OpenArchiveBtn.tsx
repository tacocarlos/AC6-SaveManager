import { useSelectedArchive } from "@src/context/SelectedContext";
import barStyles from "./ButtonBar.module.css";
import { useManager } from "@src/context/ArchiveContext";
import { openInExplorer } from "@src/util";
import { FolderArchive } from "@src/data/archive/folder_archive";
import { dialog } from "@tauri-apps/api";

export default function OpenArchiveButton() {
    const archiveID = useSelectedArchive();
    const manager = useManager();
    const archive = manager.getArchive(archiveID);

    async function openArchive() {
        if(archive === undefined) {
            return;
        }

        const folderPath = (archive as FolderArchive).getArchivePath();
        openInExplorer(folderPath).catch(() => {
            dialog.message("Couldn't open folder archive.");
        });
    }

    return <button onClick={openArchive} className={`${barStyles.btn} ${archive !== undefined ? "" : barStyles.disabled}`} disabled={archive === undefined}>
        Show Archive
    </button>
}