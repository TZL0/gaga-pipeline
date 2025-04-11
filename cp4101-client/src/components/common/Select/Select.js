import { FiChevronDown } from 'react-icons/fi';
import styles from './Select.module.css';

const Select = ({
    children,
    disabled,
    ...rest
}) => {
    return (
        <div className={styles.container}>
            <select className={styles.select} disabled={disabled} {...rest}>
                {children}   
            </select>
            <FiChevronDown className={styles.select__arrow} style={{ opacity: disabled ? 0.5 : 1 }} />
        </div>
    );
};

export default Select;