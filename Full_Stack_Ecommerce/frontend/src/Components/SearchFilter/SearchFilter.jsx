import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ onSearch, categories, tags }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedTags, setSelectedTags] = useState([]);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [priceError, setPriceError] = useState('');

    const handleSearch = () => {
        if (validatePriceRange()) {
            onSearch({
                searchTerm,
                category: selectedCategory,
                priceRange: {
                    min: priceRange.min ? parseFloat(priceRange.min) : '',
                    max: priceRange.max ? parseFloat(priceRange.max) : ''
                },
                tags: selectedTags
            });
        }
    };

    const validatePriceRange = () => {
        const min = parseFloat(priceRange.min);
        const max = parseFloat(priceRange.max);

        setPriceError('');

        if (!priceRange.min && !priceRange.max) {
            return true;
        }

        if (priceRange.min && min < 0) {
            setPriceError('Minimum price cannot be negative');
            return false;
        }

        if (priceRange.max && max < 0) {
            setPriceError('Maximum price cannot be negative');
            return false;
        }

        if (priceRange.min && priceRange.max && min > max) {
            setPriceError('Minimum price cannot be greater than maximum price');
            return false;
        }

        return true;
    };

    const handlePriceChange = (type, value) => {
        if (value === '' || value >= 0) {
            setPriceRange(prev => ({
                ...prev,
                [type]: value
            }));
            setPriceError('');
        }
    };

    const handleTagToggle = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setPriceRange({ min: '', max: '' });
        setSelectedTags([]);
        setPriceError('');
        onSearch({
            searchTerm: '',
            category: 'all',
            priceRange: { min: '', max: '' },
            tags: []
        });
    };

    return (
        <div className="search-filter">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>Search</button>
                <button
                    className="filter-toggle"
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                >
                    Filters
                </button>
            </div>

            <div className={`filter-section ${isFilterVisible ? 'visible' : ''}`}>
                <div className="filter-group">
                    <h3>Category</h3>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <h3>Price Range</h3>
                    <div className="price-inputs">
                        <input
                            type="number"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) => handlePriceChange('min', e.target.value)}
                            min="0"
                            step="0.01"
                        />
                        <span>to</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => handlePriceChange('max', e.target.value)}
                            min="0"
                            step="0.01"
                        />
                    </div>
                    {priceError && <div className="price-error">{priceError}</div>}
                </div>

                <div className="filter-group">
                    <h3>Tags</h3>
                    <div className="tags-container">
                        {tags.map(tag => (
                            <button
                                key={tag}
                                className={`tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                                onClick={() => handleTagToggle(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-actions">
                    <button onClick={handleSearch} className="apply-filters">
                        Apply Filters
                    </button>
                    <button onClick={clearFilters} className="clear-filters">
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchFilter; 