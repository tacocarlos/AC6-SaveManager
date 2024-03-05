import { createContext, useContext, useState } from "react";
import SettingsModal from "@src/components/modals/settings-modal/settings-modal";

type Callable = () => void;

const ShowSettingsModalContext = createContext<Callable>(() => {});
const CloseSettingsModalContext = createContext<Callable>(() => {});

export function useShowSettingsModal() {
    return useContext(ShowSettingsModalContext);
}

export function useCloseSettingsModal() {
    return useContext(CloseSettingsModalContext);
}

export function SettingsModalProvider({children}: {children: React.ReactElement}) {
    const [modalShow, setModalShow]=  useState(false);

    const showModal = () => setModalShow(true);
    const closeModal = () => setModalShow(false);

    return <>
        <ShowSettingsModalContext.Provider value={showModal}>
        <CloseSettingsModalContext.Provider value={closeModal}>
            {children}
            <SettingsModal isOpen={modalShow} closeButtonHandler={closeModal} modalClose={closeModal}/>
        </CloseSettingsModalContext.Provider>
        </ShowSettingsModalContext.Provider>
    </>
}