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

    const selectionStyle = props.isSelected === true ? 'bg-red-600' : '';
    const btnStyle = 'p-10 bg-gray-600 text-center mt-10 mx-5';

    const content = (
        <>
            <Button
                className={`${ArchiveStyles.vanillaArchive} ${props.isSelected === true ? ArchiveStyles.isSelected : ''} hover:bg-maroon w-52 px-1`}>
                {props.archive.getArchiveName()}
            </Button>
        </>
    );

    return <>{content}</>;
}
