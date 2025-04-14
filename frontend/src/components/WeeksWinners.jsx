import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ProductItem from './ProductItem';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const WeeksWinners = () => {
    const { weeksWinners } = React.useContext(ShopContext);
    const { t } = useLanguage();

    useEffect(() => {
        console.log('WeeksWinners rendered with:', weeksWinners?.length || 0, 'products');
    }, [weeksWinners]);

    if (!weeksWinners || weeksWinners.length === 0) {
        console.log('No winners to display');
        return null;
    }

    // 确保只显示5个商品
    const displayProducts = weeksWinners.slice(0, 5);

    return (
        <div className="my-10">
            <div className="text-center text-3xl py-8">
                <Title text1={"WEEK'S"} text2={"WINNERS"} />
                <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
                    This week's winners are the products that have been sold the most and have the highest score.
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {displayProducts.map((item, index) => (
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

export default WeeksWinners; 