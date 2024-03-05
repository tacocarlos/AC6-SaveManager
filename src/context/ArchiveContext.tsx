import { useState, createContext, useContext, SetStateAction } from "react";
import { ArchiveManager } from "../data/archive/archive_manager";

const ManagerContext = createContext<ArchiveManager>(new ArchiveManager());
const ManagerUpdateContext = createContext<React.Dispatch<SetStateAction<ArchiveManager>>>(() => {});

export function useManager() { 
    return useContext(ManagerContext);
}

export function useManagerUpdate() {
    return useContext(ManagerUpdateContext);
}

export function ArchiveProvider( {children} : {children: React.ReactElement}) {
    const [archiveManager, setArchiveManager] = useState(new ArchiveManager());

    return (
        <ManagerContext.Provider value={archiveManager}>
        <ManagerUpdateContext.Provider value={setArchiveManager}>
            {children}
        </ManagerUpdateContext.Provider>
        </ManagerContext.Provider>
    )    
}