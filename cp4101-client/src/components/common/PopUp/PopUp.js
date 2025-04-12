import { FiX } from 'react-icons/fi';
import styles from './PopUp.module.css';
import IconButton from '../IconButton';

const PopUp = ({
    children,
    zIndex = 1000,
    onClose,
    isCloseDisabled,
    style,
}) => {
    const tryClose = () => {
        if (isCloseDisabled)
            return;

        onClose();
    }

    return (
        <div className={styles.background} style={{ zIndex: zIndex }} onClick={tryClose}>
            <div className={styles.popupWrapper}>
                <div className={styles.popup} onClick={(e) => e.stopPropagation()} style={style}>
                    {children}
                    <IconButton
                        onClick={tryClose}
                        disabled={isCloseDisabled}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            fontSize: '1.5rem',
                        }}
                    >
                        <FiX/>
                    </IconButton>
                </div>
            </div>
        </div>
    );
};

export default PopUp;
