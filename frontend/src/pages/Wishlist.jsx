import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';

const Wishlist = () => {
    const { products, wishlistItems, token, navigate, removeFromWishlist, clearWishlist, addToCart } = useContext(ShopContext);
    const { t } = useLanguage();
    const [wishlistProducts, setWishlistProducts] = useState([]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Transform wishlist items into product data with sizes
        const productData = [];
        for (const itemId in wishlistItems) {
            const product = products.find(p => p._id === itemId);
            if (product) {
                const sizes = Object.keys(wishlistItems[itemId]);
                sizes.forEach(size => {
                    productData.push({
                        ...product,
                        selectedSize: size
                    });
                });
            }
        }
        setWishlistProducts(productData);
    }, [wishlistItems, products, token, navigate]);

    const handleAddToCart = async (product) => {
        try {
            await addToCart(product._id, product.selectedSize);
            await removeFromWishlist(product._id, product.selectedSize);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error(t('failedToAddToCart'));
        }
    };

    const handleRemoveFromWishlist = async (product) => {
        try {
            await removeFromWishlist(product._id, product.selectedSize);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error(t('failedToRemoveFromWishlist'));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-medium">{t('wishlist')}</h1>
                {wishlistProducts.length > 0 && (
                    <button
                        onClick={clearWishlist}
                        className="text-sm text-red-500 hover:text-red-700"
                    >
                        {t('clearWishlist')}
                    </button>
                )}
            </div>

            {wishlistProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">{t('Wishlist is Empty')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlistProducts.map((product, index) => (
                        <div key={`${product._id}-${product.selectedSize}-${index}`} className="border rounded-lg overflow-hidden">
                            <img
                                src={product.image[0]}
                                alt={product.name}
                                className="w-full aspect-square object-cover"
                            />
                            <div className="p-4">
                                <h3 className="font-medium mb-2">{product.name}</h3>
                                <p className="text-gray-600 mb-2">${product.price}</p>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-sm text-gray-500">{t('size')}:</span>
                                    <span className="font-medium">{product.selectedSize}</span>
                                    {product.sizes[product.selectedSize] <= 0 && (
                                        <span className="text-xs text-red-500">{t('outOfStock')}</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className={`flex-1 py-2 text-sm ${
                                            product.sizes[product.selectedSize] > 0
                                                ? 'bg-black text-white hover:bg-gray-800'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}
                                        disabled={product.sizes[product.selectedSize] <= 0}
                                    >
                                        {t('addToCart')}
                                    </button>
                                    <button
                                        onClick={() => handleRemoveFromWishlist(product)}
                                        className="px-4 py-2 text-sm border hover:border-red-500 hover:text-red-500"
                                    >
                                        {t('remove')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Wishlist 