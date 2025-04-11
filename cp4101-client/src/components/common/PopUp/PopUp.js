import { FiX } from 'react-icons/fi';
import styles from './PopUp.module.css';

const PopUp = ({
    children,
    zIndex = 1000,
    onClose,
    isCloseDisabled,
}) => {
    const tryClose = () => {
        if (isCloseDisabled)
            return;

        onClose();
    }

    return (
        <div className={styles.background} style={{ zIndex: zIndex }} onClick={tryClose}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                {children}
                <button
                    onClick={tryClose}
                    disabled={isCloseDisabled}
                    className={styles.closebutton}
                >
                    <FiX/>
                </button>
            </div>
        </div>
    );
};

export default PopUp;
