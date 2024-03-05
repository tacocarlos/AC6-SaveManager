import { useShowNewArchiveModal } from "@context/modal-context/NewArchiveContext"
import barStyles from "./ButtonBar.module.css";

export default function NewArchiveButton() {
    const showNewArchiveModal = useShowNewArchiveModal();

    return <>
        <button onClick={showNewArchiveModal} className={barStyles.btn}>
            Create Archive
        </button>
    </>
}