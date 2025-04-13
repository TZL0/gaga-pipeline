import { FiX } from 'react-icons/fi';
import styles from './PopUp.module.css';
import { useAppContext } from '../../../AppContext';
import IconButton from '../IconButton';
import { useCallback, useEffect, useRef, useState } from 'react';

const PopUp = ({
    children,
    id,
    onClose,
    isCloseDisabled,
    style,
}) => {
    const { popupStackRef } = useAppContext();
    const isCloseDisabledRef = useRef(isCloseDisabled);
    const popupRef = useRef(null);
    const [layer, setLayer] = useState(0);

    useEffect(() => {
        isCloseDisabledRef.current = isCloseDisabled;
    }, [isCloseDisabled]);

    useEffect(() => {
        if (popupStackRef.current.includes(id))
            return;

        popupStackRef.current.push(id);
        setLayer(100 + popupStackRef.current.length);
        return () => {
            popupStackRef.current = popupStackRef.current.filter((popUpId) => popUpId !== id);
        }
    }, [id, popupStackRef]);

    const tryClose = useCallback(() => {
        if (isCloseDisabledRef.current)
            return;

        onClose();
    }, [isCloseDisabledRef, onClose]);
    
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!popupStackRef.current || popupStackRef.current.length === 0)
                return;
    
            if (popupStackRef.current[popupStackRef.current.length - 1] !== id)
                return;

            if (!popupRef.current.contains(e.target)) {
                tryClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [popupStackRef, id, tryClose]);

    return (
        <div className={styles.background} style={{ zIndex: layer }}>
            <div className={styles.popupWrapper}>
                <div className={styles.popup} style={style} ref={popupRef}>
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
