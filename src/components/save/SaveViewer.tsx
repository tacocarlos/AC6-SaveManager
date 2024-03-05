import saveStyles from "./SaveViewer.module.css"
import { useSelectedArchive, useSelectedSave, useSelectedSaveUpdate } from "@context/SelectedContext";
import { useManager } from "@context/ArchiveContext";
import { SaveRowButtons } from "./saveBtnRow/saveBtnRow";
import { useEffect, useRef, useState } from "react";
import { SaveEntry } from "./save-entry/SaveEntry";
import SaveModal from "../modals/save-details/SaveModal";
import { NewSaveModalProvider } from "@src/context/modal-context/NewSaveContext";
import { SaveData } from "@src/data/save-data/save";

export function SaveViewer() {
    const [query, setQuery] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);
    const [saveModalShow, setSaveModalShow] = useState(false);
    const manager = useManager();
    const archiveID = useSelectedArchive();
    const selectedSave = useSelectedSave();
    const setSelectedSave = useSelectedSaveUpdate();
    const archive = manager.getArchive(archiveID);
    const isEmpty = archive === undefined;

    let filteredSaves: SaveData[] = [];

    if(archive !== undefined) {
        filteredSaves = archive.getSaves().filter( (save) => {
                return save.getMetadata().getName().toLowerCase()
                    .includes(query.toLowerCase())
        });

    }

    useEffect(() => {
        if(selectedSave === undefined) {
            return;
        }

        // if selected save is not in archive, need to unselect it
        if(isEmpty || !archive.hasSave(selectedSave)) {
            setSelectedSave(undefined);
        }

    }, [selectedSave])

    // if the selected save is not in filtered saves, append it
    // Logger.debug(filteredSaves.join());


    const saveItems = filteredSaves.map(save => {
        return <li key={save.getMetadata().getID()} style={{'listStyle': 'none', 'marginBottom': '5px'}}>
            <SaveEntry save={save} isSelected={selectedSave === save.getMetadata().getID()} modalToggle={() => setSaveModalShow(prev => !prev)}/>
        </li>
    })

    function searchBarChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        if(searchRef.current) {
            setQuery(searchRef.current.value);
        }
    }

    return (
    <>
        <NewSaveModalProvider>
            <SaveRowButtons/>
        </NewSaveModalProvider>
        <div className={saveStyles.searchBar}>
            <input className={saveStyles.searchInput} type='search'
                ref={searchRef} value={query} onChange={searchBarChange} 
                placeholder="Search by Save Name"
                disabled={isEmpty}
            />
        </div>
        <div className={saveStyles.saveImage}>
            <ul className={saveStyles.saveList}>
                {saveItems}
            </ul>
        </div>

        <SaveModal isOpen={saveModalShow} modalClose={() => setSaveModalShow(false)}/>
    </>
    );
}