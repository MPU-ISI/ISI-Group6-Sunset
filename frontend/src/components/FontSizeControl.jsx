import { useFontSize } from '../context/FontSizeContext';

const FontSizeControl = () => {
    const { fontSize, changeFontSize } = useFontSize();

    const sizes = [
        { label: 'S', value: 'small' },
        { label: 'M', value: 'medium' },
        { label: 'L', value: 'large' }
    ];

    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm">Font Size:</span>
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