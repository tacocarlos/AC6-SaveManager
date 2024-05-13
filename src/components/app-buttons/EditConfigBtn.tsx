import { Button } from '@ui/button';
import barStyles from './ButtonBar.module.css';

import { useShowSettingsModal } from '@src/context/modal-context/SettingsModalContext';

export default function EditConfigButton() {
    const showSettingsModal = useShowSettingsModal();

    return (
        <>
            <Button className={barStyles.btn} onClick={showSettingsModal}>
                Edit Config
            </Button>
        </>
    );
}
