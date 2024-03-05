import { useSelectedArchive, useSelectedSave, useSelectedSaveUpdate } from "@src/context/SelectedContext";
import barStyles from "./ButtonBar.module.css";
import { useManager, useManagerUpdate } from "@src/context/ArchiveContext";
import { Logger } from "@util";
import { dialog } from "@tauri-apps/api";

export default function DeleteArchiveButton() {
    const selectedSaveID = useSelectedSave();
    const archiveID = useSelectedArchive();
    const setSelectedSaveID = useSelectedSaveUpdate();
    const setManager = useManagerUpdate();
    const manager = useManager();
    const archive = manager.getArchive(archiveID);

    async function deleteArchive() {
        if(archive === undefined) {
          Logger.info("Archive as not selected");
          return;
        }
  
        if(await dialog.confirm("Are you sure?") === false) {
          return;
        }
  
        
        if(selectedSaveID !== undefined && archive.hasSave(selectedSaveID)) {
          setSelectedSaveID(undefined); // if archive has the selected save then get rid of it
        }
  
        // DELETE ARCHIVE
        // This actually just deletes it, make sure the user knows it can't be undone
        try {
          await manager.deleteFolderArchive(archive.getArchiveID());
          setManager(manager.shallowClone());
        } catch(reason) {
          if(reason instanceof Error) {
            Logger.error(reason.message);
          } else {
            console.log(`Failed to delete archive: ${reason}`);
          }
  
          await dialog.message("Failed to delete archive");
        }
      }

    return <>
        <button onClick={deleteArchive} className={`${barStyles.btn} ${archive !== undefined ? "" : barStyles.disabled}`} disabled={archive === undefined}>
            Delete Selected Archive
        </button>
    </>
}