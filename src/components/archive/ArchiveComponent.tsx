import { Archive } from '../../data/archive/archive';

import ArchiveStyles from './ArchiveComponent.module.css';
import { Button } from '@ui/button';

export default function ArchiveComponent(props: {
    archive: Archive;
    isSelected: boolean | undefined;
}): JSX.Element {
    if (!props.archive) {
        return <div></div>;
    }

    const content = (
        <>
            <Button
                className={`${ArchiveStyles.vanillaArchive} ${props.isSelected === true ? ArchiveStyles.isSelected : ''} w-52 px-1 hover:bg-maroon`}>
                {props.archive.getArchiveName()}
            </Button>
        </>
    );

    return <>{content}</>;
}
