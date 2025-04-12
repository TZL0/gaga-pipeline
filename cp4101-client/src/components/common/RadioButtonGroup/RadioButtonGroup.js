import styles from './RadioButtonGroup.module.css';

const RadioButtonGroup = ({
    label,
    value,
    setValue,
    options = [{ 'label': '', 'value': ''}],
    style,
    disabled,
}) => {
    return (
        <div className={styles.container}  style={style}>
            {label && <div className={styles.label}>{label}</div>}
            {options.map((opt, index) => {
                return (
                    <div
                        key={index}
                        className={styles.option}
                        onClick={disabled ? undefined : () => setValue(opt.value)}
                        style={{
                            border: value === opt.value
                                ? '1px solid var(--color-primary)'
                                : '1px solid var(--color-border',
                            opacity: disabled ? 0.5 : 1,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <input
                            type="radio"
                            value={opt.value}
                            className={styles.radiobutton}
                            checked={value === opt.value}
                            onChange={(e) => setValue(e.target.value)}
                            disabled={disabled}
                        />
                        {opt.label}
                    </div>
                );
            })}
        </div>
    );
};

export default RadioButtonGroup;