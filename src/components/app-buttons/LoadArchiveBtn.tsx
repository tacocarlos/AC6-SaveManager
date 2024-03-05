import { useManager, useManagerUpdate } from "@src/context/ArchiveContext";
import { AppConfig } from "@src/data/AppConfig";
import { FolderArchive } from "@src/data/archive/folder_archive";
import { ARCHIVE_METADATA_NAME } from "@src/data/constants/constant";
import { Logger } from "@src/util";
import { dialog } from "@tauri-apps/api";
import { basename } from "@tauri-apps/api/path";
import barStyles from "./ButtonBar.module.css";

export default function LoadArchiveButton() {
    const manager = useManager();
    const setManager = useManagerUpdate();

    
    async function loadArchive() {
        let selected = await dialog.open({
          title: "Select Archive Metadata",
          multiple: false,
          filters: [{
            name: "Metadata",
            // extensions: ['json', 'ac6meta']
            extensions: ['json']
          }, {
            name: "Any",
            extensions: ['*']
          }],
          defaultPath: AppConfig.defaultArchiveLocation
        })
        
        if(selected === null || selected === undefined) {
          return;
        }
        
        if(Array.isArray(selected)) {
          await dialog.message("Can only select a single archive at a time.");
          return;
        }
        
        if(await basename(selected as string) !==  ARCHIVE_METADATA_NAME) {
          await dialog.message("Was not a valid archive metadata name");
          return;
        }
    
        const filePath = selected as string;
    
        try {
          const archive = await FolderArchive.attemptReadFolderArchive(filePath);
          if(!manager.addArchive(archive)) {
            await dialog.message("Failed to load archive");
          }
    
          setManager(manager.shallowClone());
  
          Logger.trace("Added archive with saves: " + archive.getSaves().map(save => save.getMetadata().getName()).join(", "));
        } catch(reason: any) {
          await dialog.message("Failed to load archive");
        }
    }


    return <>
        <button onClick={loadArchive} className={barStyles.btn}>
            Load Archive
        </button>
    </>
}