import styles from './TextField.module.css';

const TextField = ({
    label,
    style,
    ...rest
}) => {
    return (
        <div className={styles.container} style={style}>
            {label && <div className={styles.label}>{label}</div>}
            <input className={styles.input} type="text" {...rest}/>
        </div>
    );
};

export default TextField;