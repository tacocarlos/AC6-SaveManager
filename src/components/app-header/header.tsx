import styles from "./header.module.css";

export default function AppHeader(): JSX.Element {
    return (
        <div className={styles.appHeader}>
            <p className={styles.headerContent}> 
                <span className={styles.seriesTitle}>Armored Core VI Save Manager</span>
            </p>
        </div>
    );
}