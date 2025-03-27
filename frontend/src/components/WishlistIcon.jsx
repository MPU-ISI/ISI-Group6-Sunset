import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { ShopContext } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { useContext } from 'react';
import { toast } from 'react-hot-toast';

const WishlistIcon = ({ productId }) => {
    const { addToWishlist, removeFromWishlist, isInWishlist, token } = useContext(ShopContext);
    const { t } = useLanguage();

    const toggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!token) {
            toast.info(t('pleaseLoginToAddToWishlist'));
            return;
        }

        try {
            if (isInWishlist(productId)) {
                await removeFromWishlist(productId);
            } else {
                await addToWishlist(productId);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast.error('Failed to update wishlist. Please try again.');
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            className="wishlist-icon"
            title={isInWishlist(productId) ? t('removeFromWishlist') : t('addToWishlist')}
        >
            {isInWishlist(productId) ? (
                <FaHeart className="text-red-500" />
            ) : (
                <FaRegHeart className="text-gray-500 hover:text-red-500" />
            )}
        </button>
    );
};

export default WishlistIcon; 