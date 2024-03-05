import { createContext, useContext, useState } from "react";
import NewSaveModal, {NewSaveType} from "@src/components/modals/new-save/NewSaveModal";

type SetStateType<T> = React.Dispatch<React.SetStateAction<T>>;
type Callable = () => void;

const ShowNewSaveModalContext = createContext<Callable>(() => {});
const CloseNewSaveModalContext = createContext<Callable>(() => {});
const SetNewSaveModalTypeContext = createContext<SetStateType<NewSaveType>>(() => {});

export function useShowNewSaveModal() {
    return useContext(ShowNewSaveModalContext);
}

export function useCloseNewSaveModal() {
    return useContext(CloseNewSaveModalContext);
}

export function useSetNewSaveModalType() {
    return useContext(SetNewSaveModalTypeContext);
}

export function NewSaveModalProvider({children}: {children: React.ReactElement}) {    
    const [modalShowStatus, setModalShowStatus] = useState(false);
    const [modalType, setModalType] = useState<NewSaveType>('backup');

    const showModal = () => setModalShowStatus(true);
    const closeModal = () => setModalShowStatus(false);
    
    return <>
        <ShowNewSaveModalContext.Provider value={showModal}>
        <CloseNewSaveModalContext.Provider value={closeModal}>
        <SetNewSaveModalTypeContext.Provider value={setModalType}>
            {children}            
            <NewSaveModal isOpen={modalShowStatus} closeModal={closeModal} newSaveType={modalType}/>
        </SetNewSaveModalTypeContext.Provider>
        </CloseNewSaveModalContext.Provider>
        </ShowNewSaveModalContext.Provider>

    </>
}