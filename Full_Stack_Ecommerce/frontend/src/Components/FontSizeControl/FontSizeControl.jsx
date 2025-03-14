import React, { useState } from 'react';
import './FontSizeControl.css';

const FontSizeControl = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentScale, setCurrentScale] = useState(() => {
        return parseFloat(localStorage.getItem('fontSizeScale')) || 1;
    });

    const handleFontSizeChange = (scale) => {
        document.documentElement.style.setProperty('--font-size-scale', scale);
        localStorage.setItem('fontSizeScale', scale);
        setCurrentScale(scale);
    };

    const fontSizes = [
        { scale: 0.75, label: 'Small' },
        { scale: 0.875, label: 'Medium-Small' },
        { scale: 1, label: 'Medium' },
        { scale: 1.125, label: 'Medium-Large' },
        { scale: 1.25, label: 'Large' },
        { scale: 1.5, label: 'Extra Large' }
    ];

    React.useEffect(() => {
        document.documentElement.style.setProperty('--font-size-scale', currentScale);
    }, []);

    return (
        <div className={`font-size-control ${isOpen ? 'open' : ''}`}>
            <button
                className="font-size-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-size-icon">A</span>
                <span className="font-size-label">Font Size</span>
            </button>
            <div className="font-size-options">
                {fontSizes.map((size) => (
                    <button
                        key={size.scale}
                        className={`font-size-option ${currentScale === size.scale ? 'active' : ''}`}
                        onClick={() => handleFontSizeChange(size.scale)}
                    >
                        {size.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FontSizeControl; 