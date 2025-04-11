import styles from './Button.module.css';

const Button = ({
    children,
    style,
    isLoading = false,
    ...rest
}) => {
    return (
        <button className={styles.button} style={style} {...rest}>
            <div className={styles.button__content} style={{ opacity: isLoading ? 0 : 1 }}>
                {children}
            </div>
            {isLoading && (
                <div
                    className="spinner"
                    style={{
                        position: 'absolute',
                        height: '50%',
                        aspectRatio: 1,
                    }}
                />
            )}
        </button>
    );
}

export default Button;
