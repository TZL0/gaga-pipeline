import { useEffect, useRef } from 'react';
import styles from './Slider.module.css';

const Slider = ({
    label,
    displayedValue,
    style,
    value,
    ...rest
}) => {
    const sliderRef = useRef(null);

    useEffect(() => {
        const val = (sliderRef.current.value - sliderRef.current.min) / (sliderRef.current.max - sliderRef.current.min) * 100;
        sliderRef.current.style.background = `linear-gradient(to right, var(--color-primary) ${val}%, whitesmoke ${val}%)`;
    }, [value])

    return (
        <div className={styles.container} style={style}>
            <div className={styles.labelRow}>
                {label && <div className={styles.label}>{label}</div>}
                {displayedValue && <div className={styles.value}>{displayedValue}</div>}
            </div>
            <input className={styles.slider} type="range" ref={sliderRef} value={value} {...rest}/>
        </div>
    );
};

export default Slider;