import { createContext, useContext, useState } from "react";
import NewArchiveModal from "@src/components/modals/create-archive/NewArchiveModal";

type Callable = () => void;

const ShowNewArchiveModalContext = createContext<Callable>(() => {});
const CloseNewArchiveModalContext = createContext<Callable>(() => {});

export function useShowNewArchiveModal() {
    return useContext(ShowNewArchiveModalContext);
}

export function useCloseNewArchiveModal() {
    return useContext(CloseNewArchiveModalContext);
}

export function NewArchiveModalProvider({children}: {children: React.ReactElement}) {
    const [modalShow, setModalShow]=  useState(false);

    const showModal = () => setModalShow(true);
    const closeModal = () => setModalShow(false);

    return <>
        <ShowNewArchiveModalContext.Provider value={showModal}>
        <CloseNewArchiveModalContext.Provider value={closeModal}>
            {children}
            <NewArchiveModal isOpen={modalShow} closeButtonHandler={closeModal} modalClose={closeModal}/>
        </CloseNewArchiveModalContext.Provider>
        </ShowNewArchiveModalContext.Provider>
    </>
}