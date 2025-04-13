import styles from './IconButton.module.css';

const IconButton = ({
    children,
    style,
    ...rest
}) => {
    return (
        <button className={styles.button} style={style} {...rest}>
            <div className={styles.button__content}>
                {children}
            </div>
        </button>
    );
}

export default IconButton;
