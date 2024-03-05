import {useState, createContext, useContext, Dispatch, SetStateAction } from "react";
import { ItemID } from "../data/ItemID";


// provide context for selected elements: selectedArchive, selectedSave

const SelectedArchiveContext = createContext<ItemID | undefined>("");
const SelectedArchiveUpdateContext = createContext<Dispatch<SetStateAction<ItemID | undefined>>>(() => {});

const SelectedSaveContext = createContext<ItemID | undefined>("");
const SelectedSaveUpdateContext = createContext<Dispatch<SetStateAction<ItemID | undefined>>>(() => {});

export function useSelectedArchive() {
    return useContext(SelectedArchiveContext);
}

export function useSelectedArchiveUpdate() {
    return useContext(SelectedArchiveUpdateContext);
}

export function useSelectedSave() {
    return useContext(SelectedSaveContext);
}

export function useSelectedSaveUpdate() {
    return useContext(SelectedSaveUpdateContext);
}


export function SelectedProvider({children} : {children: React.ReactElement}) {

    const [archive, setArchive] = useState<ItemID | undefined>(undefined);
    const [save, setSave] = useState<ItemID | undefined>(undefined);

    return <>
        <SelectedArchiveContext.Provider value={archive}>
        <SelectedArchiveUpdateContext.Provider value={setArchive}>
        <SelectedSaveContext.Provider value={save}>
        <SelectedSaveUpdateContext.Provider value={setSave}>
            { children }            
        </SelectedSaveUpdateContext.Provider>
        </SelectedSaveContext.Provider>
        </SelectedArchiveUpdateContext.Provider>
        </SelectedArchiveContext.Provider>
    </>
}

