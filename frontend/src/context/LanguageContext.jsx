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
    products: 'products'
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
    products: '个商品'
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