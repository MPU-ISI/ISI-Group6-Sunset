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
    easyReturns: 'Easy Returns within 7 Days.',
    yourCartIsEmpty: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    proceedToCheckout: 'PROCEED TO CHECKOUT',
    price: 'Price',
    size: 'Size',
    quantity: 'Quantity',
    remove: 'Remove',
    // Order related translations
    myOrders: 'My Orders',
    orderNumber: 'Order Number',
    orderDate: 'Order Date',
    orderStatus: 'Status',
    orderAmount: 'Amount',
    orderItems: 'Items',
    viewDetails: 'View Details',
    paymentMethod: 'Payment Method',
    shippingAddress: 'Shipping Address',
    orderDetails: 'Order Details',
    backToOrders: 'Back to Orders',
    orderSummary: 'Order Summary',
    items: 'Items',
    paymentStatus: 'Payment Status',
    paid: 'Paid',
    pending: 'Pending',
    lastUpdated: 'Last Updated',
    total: 'Total',
    phone: 'Phone',
    orderedItems: 'Ordered Items',
    subtotal: 'Subtotal',
    orderNotFound: 'Order not found',
    noOrders: 'You have no orders yet',
    shopNow: 'Shop Now',
    // Filter related translations
    filterByStatus: 'Filter by status',
    allOrders: 'All Orders',
    noOrdersWithStatus: 'No orders with the selected status',
    showAllOrders: 'Show all orders',
    processing: 'Processing',
    // 订单状态
    orderPlaced: 'Order Placed',
    packing: 'Packing',
    shipped: 'Shipped',
    outForDelivery: 'Out for Delivery',
    delivered: 'Delivered'
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
    easyReturns: '7天轻松退货',
    yourCartIsEmpty: '您的购物车是空的',
    continueShopping: '继续购物',
    proceedToCheckout: '结算',
    price: '价格',
    size: '尺码',
    quantity: '数量',
    remove: '删除',
    // Order related translations
    myOrders: '我的订单',
    orderNumber: '订单号',
    orderDate: '下单日期',
    orderStatus: '订单状态',
    orderAmount: '订单金额',
    orderItems: '订单商品',
    viewDetails: '查看详情',
    paymentMethod: '支付方式',
    shippingAddress: '收货地址',
    orderDetails: '订单详情',
    backToOrders: '返回订单列表',
    orderSummary: '订单摘要',
    items: '商品数量',
    paymentStatus: '支付状态',
    paid: '已支付',
    pending: '待支付',
    lastUpdated: '最后更新',
    total: '总计',
    phone: '电话',
    orderedItems: '订购商品',
    subtotal: '小计',
    orderNotFound: '订单未找到',
    noOrders: '您还没有订单',
    shopNow: '立即购物',
    // Filter related translations
    filterByStatus: '按状态筛选',
    allOrders: '全部订单',
    noOrdersWithStatus: '没有符合所选状态的订单',
    showAllOrders: '显示全部订单',
    processing: '处理中',
    // 订单状态
    orderPlaced: '已下单',
    packing: '打包中',
    shipped: '已发货',
    outForDelivery: '配送中',
    delivered: '已送达'
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