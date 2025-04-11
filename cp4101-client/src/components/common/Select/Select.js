import { FiChevronDown } from 'react-icons/fi';
import styles from './Select.module.css';

const Select = ({
    children,
    label,
    disabled,
    style,
    ...rest
}) => {
    return (
        <div className={styles.container} style={style}>
            {label && <div className={styles.label}>{label}</div>}
            <div className={styles.selectWrapper}>
                <select className={styles.select} disabled={disabled} {...rest}>
                    {children}   
                </select>
                <FiChevronDown className={styles.select__arrow} style={{ opacity: disabled ? 0.5 : 1 }} />
            </div>
        </div>
    );
};

export default Select;