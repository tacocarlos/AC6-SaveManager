import { useEffect, useState } from "react";
import appStyles from "./App.module.css";
import AppHeader from "./components/app-header/header";
import { Logger } from "@util";
import ArchiveViewer from "./components/archive/window/ArchiveViewer";
import { SaveViewer } from "./components/save/SaveViewer";
import { useSelectedArchive } from "@context/SelectedContext";
import { useManager, useManagerUpdate } from "@context/ArchiveContext";
import { ButtonBar } from "./components/app-buttons/ButtonBar";
import { useSettings } from "@context/SettingsContext";

import { dialog } from "@tauri-apps/api";

export function App() {

  const manager = useManager();
  const setManager = useManagerUpdate();
  const selectedArchive = useSelectedArchive();
  const settings = useSettings();

  const [refresh, setRefresh] = useState<boolean>(false);
  const forceRefresh = () => { setManager(manager.shallowClone()); setRefresh(!refresh)}
  
  // On initial load and whenever the manager changes, re read the archive paths
  useEffect(() => {
    manager.clearArchives();
    manager.discoverArchives(settings).then(() => {
      Logger.info("Found saves");
      forceRefresh();
    }).catch(() => {
      Logger.error("Failed to discover archives");
      dialog.message("Failed to load archives from config.", {
        type: "error",
        title: "Archive discovery failure"
      })
    });
  }, [settings.archive_paths]);

  return (
    <div className={appStyles.app}>
      <AppHeader/>      
      <ButtonBar/>
      <div className={appStyles.contentGridWrapper}>
        <div className={`${appStyles.archiveViewerComponent}`}>
          <ArchiveViewer/>
        </div>

        {/* Saves present in the archive */}
        <div className={appStyles.saveViewWrapper}>
            <SaveViewer key={selectedArchive}/>
        </div>        

      </div>
    </div>
  );
}
