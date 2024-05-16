import saveStyles from './SaveEntry.module.css';
import {
    useSelectedSave,
    useSelectedSaveUpdate,
} from '@context/SelectedContext';
import { SaveData } from '../../../data/save-data/save';
import { Logger, cn } from '@util';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeMathjax from 'rehype-mathjax';
import { AccordionContent, AccordionItem } from '@src/components/ui/accordion';
import { AccordionTrigger } from '@ui/accordion';
import { Button } from '@src/components/ui/button';
import {
    Collapsible,
    CollapsibleTrigger,
} from '@src/components/ui/collapsible';
import React, { useState } from 'react';
import { CollapsibleContent } from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

const NOTES_PREVIEW_LENGTH = 100;

export function SaveEntry({
    save,
    isSelected,
    modalToggle,
}: {
    save: SaveData;
    isSelected: boolean;
    modalToggle: any;
}) {
    const selectedSave = useSelectedSave();
    const setSelectedSave = useSelectedSaveUpdate();

    function selectSave(
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) {
        setSelectedSave(save.getMetadata().getID());
        Logger.info('selectSave()');
        if (event.detail === 2) {
            showDetails();
        }
    }

    // Since the button is nested within
    function showDetails() {
        setSelectedSave(save.getMetadata().getID());
        modalToggle();
    }

    const isOpen = selectedSave === save.getMetadata().getID();
    function handleOpen() {
        if (selectedSave === save.getMetadata().getID()) {
            setSelectedSave(undefined);
        } else {
            setSelectedSave(save.getMetadata().getID());
        }
    }

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={handleOpen}
            className="flex flex-col rounded border border-white text-white">
            {/* value={save.getMetadata().getID()}
            className="text-white"> */}
            <CollapsibleTrigger
                // onClick={selectSave}
                className={cn('h-full rounded border border-blue-600 px-1', {
                    'bg-actualgray': isOpen,
                })}>
                <div className="flex flex-col items-start">
                    <p className="text-2xl">{save.getMetadata().getName()}</p>
                    <br />
                    <p className=" flex w-full text-lg">
                        Last Updated:{' '}
                        {save.getMetadata().getLMDate().toString()}
                        <ChevronDown
                            className={cn(
                                'invisible w-0',
                                { visible: !isOpen, 'w-56': !isOpen },
                                'self-end'
                            )}
                            size="40"
                        />
                        <ChevronUp
                            className={cn(
                                'invisible w-0',
                                { visible: isOpen, 'w-56': isOpen },
                                'self-end'
                            )}
                            size={40}
                        />
                    </p>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden transition-all">
                {/* {notesPreview} */}
                <Markdown
                    className="text-lg"
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeMathjax]}>
                    {save.getMetadata().getNotes()}
                </Markdown>
                <br />
                <Button className="hover:bg-blue-800" onClick={showDetails}>
                    Show Details
                </Button>
            </CollapsibleContent>
        </Collapsible>
    );

    // return (
    //     <AccordionItem
    //         value={save.getMetadata().getID()}
    //         className="text-white">
    //         <AccordionTrigger onClick={selectSave}>
    //             <div className="flex flex-col items-start">
    //                 <p className="text-2xl">{save.getMetadata().getName()}</p>
    //                 <br />
    //                 <p className="text-lg">
    //                     Last Updated:{' '}
    //                     {save.getMetadata().getLMDate().toString()}
    //                 </p>
    //             </div>
    //         </AccordionTrigger>
    //         <AccordionContent>
    //             {/* {notesPreview} */}
    //             <Markdown
    //                 className="text-lg"
    //                 remarkPlugins={[remarkMath, remarkGfm]}
    //                 rehypePlugins={[rehypeRaw, rehypeMathjax]}>
    //                 {save.getMetadata().getNotes()}
    //             </Markdown>
    //             <br />
    //             <Button className="hover:bg-blue-800" onClick={showDetails}>
    //                 Show Details
    //             </Button>
    //         </AccordionContent>
    //     </AccordionItem>
    // );

    // return (
    //     <div
    //         onClick={selectSave}
    //         className={`${saveStyles.saveEntryWrapper} ${selectedStyle}`}>
    //         <h2
    //             className={`${saveStyles.saveName} text-xl font-bold text-primary-foreground`}>
    //             {save.getMetadata().getName()}
    //         </h2>

    //         <div>{save.getMetadata().getLMDate().toString()}</div>
    //         <div className={saveStyles.noteWrapper}>
    //             <Markdown
    //                 className={saveStyles.notePreview}
    //                 remarkPlugins={[remarkGfm, remarkMath]}
    //                 rehypePlugins={[]}>
    //                 {notesPreview}
    //             </Markdown>
    //         </div>
    //         <br />
    //         <button onClick={showDetails}>Show Details</button>
    //     </div>
    // );
}
