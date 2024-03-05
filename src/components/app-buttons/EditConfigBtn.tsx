import barStyles from "./ButtonBar.module.css";

import { useShowSettingsModal } from "@src/context/modal-context/SettingsModalContext"

export default function EditConfigButton() {
    const showSettingsModal = useShowSettingsModal();

    return <>
        <button className={barStyles.btn} onClick={showSettingsModal}>
            Edit Config
        </button>
    </>
}