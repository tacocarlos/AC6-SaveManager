// import { Archive } from "../../../data/archive/archive";

import ArchiveComponent from "../ArchiveComponent";

import archiveStyles from './ArchiveViewer.module.css';
import { Logger } from "../../../util";
import { useManager } from "../../../context/ArchiveContext";
import { useSelectedArchive, useSelectedArchiveUpdate } from "../../../context/SelectedContext";

// The component that displays the archives in a list and a button to create a new one
export default function ArchiveViewer() {

    const manager = useManager();

    const archives = manager.getArchives();
    const selectedArchive = useSelectedArchive();
    const setSelected = useSelectedArchiveUpdate();

    const archiveContent = archives.map( archive => (
        <li key={archive.getArchiveID()} 
            onClick={() => {
                setSelected(archive.getArchiveID());
                Logger.info("selected: " + archive.getArchiveName() + " || " + archive.getArchiveID())
            }}
        >
            <ArchiveComponent archive={archive} isSelected={selectedArchive === archive.getArchiveID()} />
        </li>
    )); 

    return (
        <div className={`${archiveStyles.archiveContainer}`}>
            <ul className={`${archiveStyles.archiveList}`}>
                {archiveContent}
            </ul>
        </div>
    );
}