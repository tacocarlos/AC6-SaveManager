import React, { createContext, useContext, useState } from "react";
import { AppConfig } from "../data/AppConfig";
import { dialog } from "@tauri-apps/api";
import { getFormattedPath } from "@src/util";

type SetSettingsContextType = React.Dispatch<React.SetStateAction<AppConfig>>;

const AppSettings = createContext(AppConfig.default());
const AppSettingsUpdateContext = createContext<SetSettingsContextType>(() => {});


export function useSettings() {
    return useContext(AppSettings);
}

export function useSettingsUpdate() {
    return useContext(AppSettingsUpdateContext);
}

const initalizedConfig = await AppConfig.init();

if(initalizedConfig.get_save_path() == "") {
    try {
        const saveLocations = await initalizedConfig.findSaveLocation();
        const chosen = saveLocations[0];
        if(saveLocations.length > 1) {
            await dialog.message("Found multiple save files (maybe multiple steam accounts?)\nSelecting " + getFormattedPath(chosen), {"title": "Multiple Save Files", "type": "info"});
        }
        await initalizedConfig.set_save_path(chosen);
    } catch(reason: any) {
        await dialog.message("Failed to find the save file for AC6.\nPlease set it manually in 'Edit Config'", {"type": "error"});
    }
}

export function SettingsProvider( {children} : {children: React.ReactElement} ) {
    const [ settings, setSettings ] = useState(initalizedConfig);

    return (
        <>
            <AppSettings.Provider value={settings}>
            <AppSettingsUpdateContext.Provider value={setSettings}>
                {children}
            </AppSettingsUpdateContext.Provider>
            </AppSettings.Provider>
        </>        
    );
}