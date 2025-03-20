import { createContext, useState, useContext } from 'react';

export const LanguageContext = createContext();

export const useLanguage = () => {
  return useContext(LanguageContext);
};

const translations = {
  en: {
    home: 'HOME',
    collection: 'COLLECTION',
    about: 'ABOUT',
    contact: 'CONTACT',
    search: 'Search',
    profile: 'My Profile',
    orders: 'Orders',
    logout: 'Logout',
    filters: 'FILTERS',
    categories: 'CATEGORIES',
    type: 'TYPE',
    priceRange: 'PRICE RANGE',
    enterPriceRange: 'Enter price range to filter products',
    allCollections: 'ALL COLLECTIONS',
    sortBy: 'Sort by:',
    relevant: 'Relevant',
    lowToHigh: 'Low to High',
    highToLow: 'High to Low',
    previous: 'Previous',
    next: 'Next',
    showing: 'Showing',
    of: 'of',
    products: 'products',
    back: 'Back',
    cart: 'CART',
    pleaseLogin: 'Please login to view your cart',
    pleaseLoginToAddToCart: 'Please login to add items to your cart',
    selectSize: 'Select Size',
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    allSizesOutOfStock: 'All sizes are out of stock',
    productDescription: 'Product Description',
    reviews: 'Reviews',
    authentic: '100% Authentic Products.',
    cashOnDelivery: 'Cash on Delivery Available.',
    easyReturns: 'Easy Returns within 7 Days.'
  },
  zh: {
    home: '首页',
    collection: '商品',
    about: '关于',
    contact: '联系',
    search: '搜索',
    profile: '我的资料',
    orders: '订单',
    logout: '退出',
    filters: '筛选',
    categories: '分类',
    type: '类型',
    priceRange: '价格范围',
    enterPriceRange: '输入价格范围筛选商品',
    allCollections: '全部商品',
    sortBy: '排序方式：',
    relevant: '相关度',
    lowToHigh: '价格从低到高',
    highToLow: '价格从高到低',
    previous: '上一页',
    next: '下一页',
    showing: '显示',
    of: '共',
    products: '个商品',
    back: '返回',
    cart: '购物车',
    pleaseLogin: '请登录查看您的购物车',
    pleaseLoginToAddToCart: '请登录后将商品添加到购物车',
    selectSize: '选择尺码',
    addToCart: '加入购物车',
    outOfStock: '缺货',
    allSizesOutOfStock: '所有尺码均已缺货',
    productDescription: '商品描述',
    reviews: '评价',
    authentic: '100% 正品保证',
    cashOnDelivery: '支持货到付款',
    easyReturns: '7天轻松退货'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}; 