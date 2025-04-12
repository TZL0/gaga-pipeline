import styles from './Panel.module.css';

const Panel = ({
    children,
    style,
}) => {
    return (
        <div className={styles.panel} style={style}>
            {children}
        </div>
    );
};

export default Panel;
