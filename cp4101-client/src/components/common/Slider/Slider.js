import styles from './Slider.module.css';

const Slider = ({
    label,
    displayedValue,
    style,
    ...rest
}) => {
    return (
        <div className={styles.container} style={style}>
            <div className={styles.labelRow}>
                {label && <div className={styles.label}>{label}</div>}
                {displayedValue && <div className={styles.value}>{displayedValue}</div>}
            </div>
            <input className={styles.slider} type="range" {...rest}/>
        </div>
    );
};

export default Slider;