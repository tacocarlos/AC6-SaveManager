import { Archive } from "../../data/archive/archive";

import ArchiveStyles from "./ArchiveComponent.module.css";

export default function ArchiveComponent(props: {archive: Archive, isSelected: boolean | undefined} ): JSX.Element {

    if(!props.archive) {
        return <div></div>
    }
    
    const content = <>
        <div className={`${ArchiveStyles.vanillaArchive} ${props.isSelected === true ? ArchiveStyles.isSelected : ""}`}>
            {props.archive.getArchiveName()}
        </div>
    </>;

return (<>
            {content}
    </>)
}