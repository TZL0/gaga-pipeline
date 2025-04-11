import styles from './TextField.module.css';

const TextField = ({
    label,
    style,
    inputStyle,
    isNumber = false,
    ...rest
}) => {
    return (
        <div className={styles.container} style={style}>
            {label && <div className={styles.label}>{label}</div>}
            <input className={styles.input} type={isNumber ? 'number' : 'text'} style={inputStyle} {...rest}/>
        </div>
    );
};

export default TextField;