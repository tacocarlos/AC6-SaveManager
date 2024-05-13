import saveStyles from './SaveEntry.module.css';
import { useSelectedSaveUpdate } from '@context/SelectedContext';
import { SaveData } from '../../../data/save-data/save';
import { Logger } from '@util';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const NOTES_PREVIEW_LENGTH = 100;

export function SaveEntry({
    save,
    isSelected,
    modalToggle,
}: {
    save: SaveData;
    isSelected: boolean;
    modalToggle: any;
}): JSX.Element {
    const setSelectedSave = useSelectedSaveUpdate();

    function selectSave(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        setSelectedSave(save.getMetadata().getID());
        Logger.info('selectSave()');
        if (event.detail === 2) {
            showDetails();
        }
    }

    // Since the button is nested within
    function showDetails() {
        modalToggle();
    }

    const notesPreview = save
        .getMetadata()
        .getNotes()
        .substring(0, NOTES_PREVIEW_LENGTH);
    const selectedStyle = isSelected ? `${saveStyles.selectedSave}` : '';

    return (
        <div
            onClick={selectSave}
            className={`${saveStyles.saveEntryWrapper} ${selectedStyle}`}>
            <h2
                className={`${saveStyles.saveName} text-xl font-bold text-primary-foreground`}>
                {save.getMetadata().getName()}
            </h2>

            <div>{save.getMetadata().getLMDate().toString()}</div>
            <div className={saveStyles.noteWrapper}>
                <Markdown
                    className={saveStyles.notePreview}
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[]}>
                    {notesPreview +
                        (save.getMetadata().getNotes().length >
                        NOTES_PREVIEW_LENGTH
                            ? '...'
                            : '')}
                </Markdown>
            </div>
            <br />
            <button onClick={showDetails}>Show Details</button>
        </div>
    );
}
