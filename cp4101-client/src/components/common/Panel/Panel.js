import styles from './Panel.module.css';

const Panel = ({
    children,
}) => {
    return (
        <div className={styles.panel}>
            {children}
        </div>
    );
};

export default Panel;
