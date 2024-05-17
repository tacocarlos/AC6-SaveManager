import saveStyles from './SaveViewer.module.css';
import {
    useSelectedArchive,
    useSelectedSave,
    useSelectedSaveUpdate,
} from '@context/SelectedContext';
import { useManager } from '@context/ArchiveContext';
import { SaveRowButtons } from './saveBtnRow/saveBtnRow';
import { useEffect, useRef, useState } from 'react';
import { SaveEntry } from './save-entry/SaveEntry';
import SaveModal from '../modals/save-details/SaveModal';
import { NewSaveModalProvider } from '@src/context/modal-context/NewSaveContext';
import { SaveData } from '@src/data/save-data/save';
import { Input } from '@ui/input';
import { ScrollArea } from '@ui/scroll-area';
import { Accordion } from '../ui/accordion';
import { useToast } from '../ui/use-toast';

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

    const save = archive?.getSave(selectedSave ?? '');

    let filteredSaves: SaveData[] = [];
    const { toast } = useToast();

    // TODO: memoify this later
    if (archive !== undefined) {
        filteredSaves = archive
            .getSaves()
            .filter((save) => {
                return save
                    .getMetadata()
                    .getName()
                    .toLowerCase()
                    .includes(query.toLowerCase());
            })
            .sort((s1, s2) => {
                const s1DateStr = s1.getMetadata().getLMDate().toString();
                const s2DateStr = s2.getMetadata().getLMDate().toString();
                return -1 * s1DateStr.localeCompare(s2DateStr);
            });
    }

    useEffect(() => {
        if (selectedSave === undefined) {
            return;
        }

        // if selected save is not in archive, need to unselect it
        if (isEmpty || !archive.hasSave(selectedSave)) {
            setSelectedSave(undefined);
        }
    }, [selectedSave]);

    // if the selected save is not in filtered saves, append it
    // Logger.debug(filteredSaves.join());
    const modalToggle = () => {
        toast({
            description: 'modal toggle',
        });

        setSaveModalShow((prev) => !prev);
    };
    const saveItems = filteredSaves.map((save) => {
        return (
            <li
                key={save.getMetadata().getID()}
                style={{ listStyle: 'none', marginBottom: '5px' }}>
                <SaveEntry
                    save={save}
                    isSelected={selectedSave === save.getMetadata().getID()}
                    // modalToggle={() => setSaveModalShow((prev) => !prev)}
                    modalToggle={modalToggle}
                />
            </li>
        );
    });

    function searchBarChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        if (searchRef.current) {
            setQuery(searchRef.current.value);
        }
    }

    const filteredSaveIDs = filteredSaves.map((s) => s.getMetadata().getID());

    // TODO: implement a 'collapsible sync' so only one is open at a time.
    // TODO: this is due to an accordion not really (but very close) to what I wanted for this component

    return (
        <div className="w-full">
            <NewSaveModalProvider>
                <SaveRowButtons />
            </NewSaveModalProvider>
            <div className={saveStyles.searchBar}>
                <Input
                    className={saveStyles.searchInput}
                    type="search"
                    ref={searchRef}
                    value={query}
                    onChange={searchBarChange}
                    placeholder="Search by Save Name"
                    disabled={isEmpty}
                />
                {save !== undefined ? (
                    <div className="ml-4 flex rounded-xl border px-4">
                        <p className="self-center text-lg text-white">
                            Selected Save: {save.getMetadata().getName()}
                        </p>
                        <p className="text-md self-center pl-4 text-muted">
                            Last Updated:{' '}
                            {save.getMetadata().getLMDate().toString()}
                        </p>
                    </div>
                ) : null}
            </div>
            <div className={`${saveStyles.saveImage}`}>
                <ScrollArea className="bg-actualgray flex h-[calc(100vh-235px)] w-full flex-col gap-y-1 bg-opacity-30">
                    {saveItems}
                </ScrollArea>
            </div>

            <SaveModal
                isOpen={saveModalShow}
                modalClose={() => setSaveModalShow(false)}
            />
        </div>
    );
}
