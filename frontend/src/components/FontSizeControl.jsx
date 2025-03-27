import { useFontSize } from '../context/FontSizeContext';

const FontSizeControl = () => {
    const { fontSize, changeFontSize } = useFontSize();

    const sizes = [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' }
    ];

    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm">字体大小：</span>
            {sizes.map((size) => (
                <button
                    key={size.value}
                    onClick={() => changeFontSize(size.value)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${fontSize === size.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                >
                    {size.label}
                </button>
            ))}
        </div>
    );
};

export default FontSizeControl; 