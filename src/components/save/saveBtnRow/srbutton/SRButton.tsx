import styles from './SRButton.module.css';
import { Button } from '@ui/button';

function genClassName(cn: string[]) {
    return cn.join(' ');
}

export function SRButton({
    active,
    action,
    children,
    className,
}: {
    active?: boolean;
    action: React.MouseEventHandler;
    children: React.ReactElement;
    className?: string;
}) {
    if (active === undefined) active = true; // if `active` is not passed, then it is assumed to be active

    const styleName = genClassName([
        styles.btn,
        active ? styles.activeBtn : styles.inactiveBtn,
        className ?? '',
    ]);

    return (
        <Button
            onClick={action}
            className={`${styleName} hover:text-white`}
            disabled={!active}>
            {children}
        </Button>
    );
}
