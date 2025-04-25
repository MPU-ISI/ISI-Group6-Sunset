import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import Title from './Title';
import ProductItem from './ProductItem';

const RecommendForYou = () => {
    const { products, token } = useContext(ShopContext);
    const { t } = useLanguage();
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    useEffect(() => {
        // 如果用户未登录，不处理推荐
        if (!token) {
            return;
        }

        // 从localStorage获取用户偏好
        const getUserPreferences = () => {
            const storedPreferences = localStorage.getItem('userPreferences');
            if (storedPreferences) {
                return JSON.parse(storedPreferences);
            }
            return {
                categories: {},
                subCategories: {}
            };
        };

        const userPreferences = getUserPreferences();
        
        // 查找首选类别和子类别
        let preferredCategory = '';
        let preferredSubCategory = '';
        let maxCategoryCount = 0;
        let maxSubCategoryCount = 0;

        // 找出用户搜索最多的类别
        Object.keys(userPreferences.categories || {}).forEach(category => {
            if (userPreferences.categories[category] > maxCategoryCount) {
                maxCategoryCount = userPreferences.categories[category];
                preferredCategory = category;
            }
        });

        // 找出用户搜索最多的子类别
        Object.keys(userPreferences.subCategories || {}).forEach(subCategory => {
            if (userPreferences.subCategories[subCategory] > maxSubCategoryCount) {
                maxSubCategoryCount = userPreferences.subCategories[subCategory];
                preferredSubCategory = subCategory;
            }
        });

        // 基于偏好筛选产品
        let filteredProducts = [...products];
        
        // 首先检查购物车和愿望单中的商品
        const cartItems = localStorage.getItem('cartItems');
        const wishlistItems = localStorage.getItem('wishlistItems');
        
        if (preferredCategory) {
            filteredProducts = filteredProducts.filter(product => product.category === preferredCategory);
        } else if (preferredSubCategory) {
            filteredProducts = filteredProducts.filter(product => product.subCategory === preferredSubCategory);
        }
        
        // 如果没有足够的推荐产品，使用随机产品填充
        if (filteredProducts.length < 5) {
            // 添加一些随机产品来补足
            const randomProducts = products
                .filter(p => !filteredProducts.some(fp => fp._id === p._id))
                .sort(() => 0.5 - Math.random());
            
            filteredProducts = [...filteredProducts, ...randomProducts];
        }
        
        // 只取前5个产品
        setRecommendedProducts(filteredProducts.slice(0, 5));
    }, [products, token]);

    // 如果用户未登录或没有推荐产品，则不显示此组件
    if (!token || !recommendedProducts || recommendedProducts.length === 0) {
        return null;
    }

    return (
        <div className="my-10">
            <div className="text-center text-3xl py-8">
                <Title text1={"RECOMMEND"} text2={"FOR YOU"} />
                <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
                    Products recommended based on your browsing preferences and search history.
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {recommendedProducts.map((item, index) => (
                    <ProductItem 
                        key={item._id || index}
                        id={item._id}
                        name={item.name}
                        price={item.price}
                        image={item.image}
                        isOnPromotion={item.isOnPromotion}
                        promotionPrice={item.promotionPrice}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecommendForYou; 