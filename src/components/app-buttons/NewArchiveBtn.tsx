import { useShowNewArchiveModal } from '@context/modal-context/NewArchiveContext';
import { Button } from '@ui/button';

export default function NewArchiveButton() {
    const showNewArchiveModal = useShowNewArchiveModal();
    return <Button onClick={showNewArchiveModal}>Create Archive</Button>;
}
