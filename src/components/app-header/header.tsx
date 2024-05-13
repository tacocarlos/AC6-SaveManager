// import styles from "./header.module.css";

export default function AppHeader(): JSX.Element {
    return (
        // <div className={styles.appHeader}>
        //     <p className={styles.headerContent}>
        //         <span className={styles.seriesTitle}>Armored Core VI Save Manager</span>
        //     </p>
        // </div>

        <div className="w-100 bg-maroon flex h-20 p-5 font-bold text-primary-foreground ">
            <p className="text-2xl">Armored Core VI Save Manager</p>
        </div>
    );
}
