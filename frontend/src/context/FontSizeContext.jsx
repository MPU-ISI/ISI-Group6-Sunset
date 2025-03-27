import { createContext, useContext, useState } from 'react';

const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState('medium'); // 默认中等大小

    const changeFontSize = (size) => {
        setFontSize(size);
    };

    return (
        <FontSizeContext.Provider value={{ fontSize, changeFontSize }}>
            {children}
        </FontSizeContext.Provider>
    );
};

export const useFontSize = () => {
    const context = useContext(FontSizeContext);
    if (!context) {
        throw new Error('useFontSize must be used within a FontSizeProvider');
    }
    return context;
}; 