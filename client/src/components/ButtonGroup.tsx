import '../App.scss';

interface ButtonGroupProps {
    buttons: {
        label: string;
        onClick: () => void;
        disabled?: boolean;
        className?: string
    }[];
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ buttons }) => {
    return (
        <div className="button-group">
            <button
                className={buttons[0].className}
                onClick={buttons[0].onClick}
                disabled={buttons[0].disabled || false}
            >
                {buttons[0].label}
            </button>
            <div className="right">
                {buttons.slice(1).map((button, index) => (
                    <button
                        key={index}
                        className={button.className}
                        onClick={button.onClick}
                        disabled={button.disabled || false}
                    >
                        {button.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default ButtonGroup;