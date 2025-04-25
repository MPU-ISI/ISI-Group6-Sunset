import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '$';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [wishlistItems, setWishlistItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('')
    const [weeksWinners, setWeeksWinners] = useState([]);
    const [salesData, setSalesData] = useState({});
    const navigate = useNavigate();

    // 更新用户偏好记录
    const updateUserPreferences = (category, subCategory) => {
        try {
            // 从localStorage获取当前用户偏好
            const storedPreferences = localStorage.getItem('userPreferences');
            let userPreferences = {
                categories: {},
                subCategories: {}
            };
            
            if (storedPreferences) {
                userPreferences = JSON.parse(storedPreferences);
            }
            
            // 更新类别计数
            if (category) {
                if (!userPreferences.categories) {
                    userPreferences.categories = {};
                }
                userPreferences.categories[category] = (userPreferences.categories[category] || 0) + 1;
            }
            
            // 更新子类别计数
            if (subCategory) {
                if (!userPreferences.subCategories) {
                    userPreferences.subCategories = {};
                }
                userPreferences.subCategories[subCategory] = (userPreferences.subCategories[subCategory] || 0) + 1;
            }
            
            // 将更新后的偏好保存到localStorage
            localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
        } catch (error) {
            console.error('Error updating user preferences:', error);
        }
    };

    // 当用户搜索时更新偏好
    const handleSearch = (searchTerm) => {
        setSearch(searchTerm);
        
        // 检查搜索词是否匹配任何类别或子类别
        const categories = ['Men', 'Women', 'Kids'];
        const subCategories = ['Topwear', 'Bottomwear', 'Winterwear'];
        
        // 尝试匹配类别
        const matchedCategory = categories.find(cat => 
            searchTerm.toLowerCase().includes(cat.toLowerCase())
        );
        
        // 尝试匹配子类别
        const matchedSubCategory = subCategories.find(subCat => 
            searchTerm.toLowerCase().includes(subCat.toLowerCase())
        );
        
        // 更新用户偏好
        updateUserPreferences(matchedCategory, matchedSubCategory);
    };

    const addToCart = async (itemId, size) => {
        if (!size) {
            toast.error('Please select a size');
            return;
        }

        // Check stock
        const product = products.find(p => p._id === itemId);
        if (!product) {
            toast.error('Product does not exist');
            return;
        }

        if (!product.sizes || product.sizes[size] <= 0) {
            toast.error('Selected size is out of stock');
            return;
        }

        // 更新用户偏好
        updateUserPreferences(product.category, product.subCategory);

        let cartData = structuredClone(cartItems);
        const currentQuantity = cartData[itemId]?.[size] || 0;
        
        // Check if adding one more would exceed stock
        if (currentQuantity + 1 > product.sizes[size]) {
            toast.error(`Insufficient stock. Available: ${product.sizes[size]}`);
            return;
        }

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {
                // Only update cart, not stock
                await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } });
                toast.success('Added to cart');
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    const getCartCount = () => {
        // 如果购物车为空或产品列表为空，直接返回0
        if (Object.keys(cartItems).length === 0 || products.length === 0) {
            return 0;
        }
        
        let totalCount = 0;
        for (const items in cartItems) {
            // 检查该商品是否存在于products中
            const productExists = products.find(p => p._id === items);
            if (!productExists) continue;

            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        // 检查该尺码的库存是否足够
                        const sizeAvailable = productExists.sizes && productExists.sizes[item] > 0;
                        if (sizeAvailable) {
                            totalCount += cartItems[items][item];
                        }
                    }
                } catch (error) {
                    console.error("Error counting cart items:", error);
                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {
        // Find current product
        const product = products.find(p => p._id === itemId);
        if (!product) {
            toast.error('Product does not exist');
            return;
        }

        // Get current quantity in cart
        let cartData = structuredClone(cartItems);
        const currentQuantity = cartData[itemId]?.[size] || 0;
        
        // 如果数量为0，表示删除该项目
        if (quantity === 0) {
            if (cartData[itemId] && cartData[itemId][size]) {
                delete cartData[itemId][size];
                
                // 如果该商品没有尺码了，删除整个商品对象
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }
                
                setCartItems(cartData);
                
                if (token) {
                    try {
                        await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity: 0 }, { headers: { token } });
                        toast.success('Removed from cart');
                    } catch (error) {
                        console.log(error);
                        toast.error(error.message);
                    }
                }
            }
            return;
        }
        
        // If decreasing quantity
        if (quantity < currentQuantity) {
            cartData[itemId][size] = quantity;
            setCartItems(cartData);

            if (token) {
                try {
                    // Only update cart
                    await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } });
                } catch (error) {
                    console.log(error);
                    toast.error(error.message);
                }
            }
        } 
        // If increasing quantity
        else if (quantity > currentQuantity) {
            // Check if there's enough stock
            if (!product.sizes || product.sizes[size] < quantity) {
                toast.error(`Insufficient stock. Available: ${product.sizes?.[size] || 0}`);
                return;
            }

            cartData[itemId][size] = quantity;
            setCartItems(cartData);

            if (token) {
                try {
                    // Only update cart
                    await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } });
                    toast.success('Updated cart');
                } catch (error) {
                    console.log(error);
                    toast.error(error.message);
                }
            }
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (!itemInfo) continue; // 如果产品不存在则跳过
            
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        // 检查该尺码是否有库存
                        const sizeAvailable = itemInfo.sizes && itemInfo.sizes[item] > 0;
                        if (sizeAvailable) {
                            // 使用促销价格(如果有)或原价
                            const price = (itemInfo.isOnPromotion && itemInfo.promotionPrice && itemInfo.promotionPrice < itemInfo.price) 
                                ? itemInfo.promotionPrice 
                                : itemInfo.price;
                            totalAmount += price * cartItems[items][item];
                        }
                    }
                } catch (error) {
                    console.error("Error calculating cart amount:", error);
                }
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                const productsData = response.data.products.reverse();
                setProducts(productsData);
                console.log('Products loaded:', productsData.length);
                // 获取产品后立即检查促销状态并更新Week's Winners
                checkPromotionDates();
                return productsData; // 返回加载的产品数据
            } else {
                toast.error(response.data.message);
                return [];
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            return [];
        }
    }

    const getUserCart = async ( token ) => {
        try {
            
            const response = await axios.post(backendUrl + '/api/cart/get',{},{headers:{token}})
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        const initializeData = async () => {
            try {
                // 先获取产品数据
                const productsData = await getProductsData();
                console.log('Initial products loaded:', productsData.length);
                
                // 使用获取到的产品数据来获取销售数据和更新Week's Winners
                if (productsData && productsData.length > 0) {
                    await fetchSalesData(productsData);
                }
            } catch (error) {
                console.error('Error initializing data:', error);
            }
        };
        
        initializeData();
        
        // 设置定时器，每小时检查一次促销状态
        const promotionCheckInterval = setInterval(() => {
            checkPromotionDates();
        }, 60 * 60 * 1000);

        // 设置定时器，每分钟更新一次Week's Winners
        const winnersUpdateInterval = setInterval(() => {
            fetchSalesData();
        }, 60 * 1000);
        
        return () => {
            clearInterval(promotionCheckInterval);
            clearInterval(winnersUpdateInterval);
        };
    }, []);

    // 检查促销是否过期并更新本地状态
    const checkPromotionDates = () => {
        const now = new Date();
        const updatedProducts = products.map(product => {
            // 如果产品当前是促销状态且促销结束日期已过，则取消促销状态
            if (product.isOnPromotion && product.promotionEndDate && new Date(product.promotionEndDate) < now) {
                return { ...product, isOnPromotion: false };
            }
            // 如果产品当前不是促销状态但促销开始日期已到且结束日期未到，则激活促销状态
            if (!product.isOnPromotion && product.promotionStartDate && product.promotionEndDate && 
                new Date(product.promotionStartDate) <= now && new Date(product.promotionEndDate) > now) {
                return { ...product, isOnPromotion: true };
            }
            return product;
        });
        
        // 只有在有变化时才更新状态
        if (JSON.stringify(updatedProducts) !== JSON.stringify(products)) {
            setProducts(updatedProducts);
        }
    };

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
            getUserWishlist(localStorage.getItem('token'))
        }
        if (token) {
            getUserCart(token)
            getUserWishlist(token)
        }
    }, [token])

    const addToWishlist = async (itemId, size) => {
        if (!size) {
            toast.error('Please select a size');
            return;
        }

        // 查找对应产品并更新用户偏好
        const product = products.find(p => p._id === itemId);
        if (product) {
            updateUserPreferences(product.category, product.subCategory);
        }

        let wishlistData = structuredClone(wishlistItems);
        if (wishlistData[itemId]) {
            wishlistData[itemId][size] = true;
        } else {
            wishlistData[itemId] = {};
            wishlistData[itemId][size] = true;
        }

        setWishlistItems(wishlistData);

        if (token) {
            try {
                const response = await axios.post(backendUrl + '/api/wishlist/add', { itemId, size }, { headers: { token } });
                if (response.data.success) {
                    toast.success('Added to wishlist');
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    const removeFromWishlist = async (itemId, size) => {
        let wishlistData = structuredClone(wishlistItems);
        if (wishlistData[itemId] && wishlistData[itemId][size]) {
            delete wishlistData[itemId][size];
            if (Object.keys(wishlistData[itemId]).length === 0) {
                delete wishlistData[itemId];
            }
            setWishlistItems(wishlistData);

            if (token) {
                try {
                    // 确保传递所有必要的参数
                    await axios.post(backendUrl + '/api/wishlist/remove', { itemId, size }, { headers: { token } });
                    toast.success('Removed from wishlist');
                } catch (error) {
                    console.log(error);
                    toast.error(error.message);
                }
            }
        }
    }

    const clearWishlist = async () => {
        if (!window.confirm('Are you sure you want to clear your wishlist?')) return;
        
        setWishlistItems({});

        if (token) {
            try {
                await axios.post(backendUrl + '/api/wishlist/clear', {}, { headers: { token } });
                toast.success('Wishlist cleared');
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    const getUserWishlist = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/wishlist/get', {}, { headers: { token } });
            if (response.data.success) {
                setWishlistItems(response.data.wishlistData);
                // 获取愿望单数据后检查是否有促销商品
                checkWishlistPromotion();
            }
        } catch (error) {
            console.log(error);
            // 失败时提示用户但不显示具体错误，以免影响用户体验
            toast.error('Failed to load wishlist');
        }
    }
    
    // 检查愿望单中是否有促销商品
    const checkWishlistPromotion = (showNotification = false) => {
        // 如果愿望单为空或产品列表为空，直接返回
        if (Object.keys(wishlistItems).length === 0 || products.length === 0) {
            return false;
        }
        
        // 遍历愿望单中的所有商品
        for (const itemId in wishlistItems) {
            // 查找对应的产品信息
            const product = products.find(p => p._id === itemId);
            
            // 如果产品存在且正在促销
            if (product && product.isOnPromotion && product.promotionPrice && product.promotionPrice < product.price) {
                // 只在指定时显示通知
                if (showNotification) {
                    toast.info('Your Wishlist has Promotion!', {
                        position: 'top-right',
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
                
                // 返回true表示找到了促销商品
                return true;
            }
        }
        
        // 没有找到促销商品
        return false;
    }

    const isInWishlist = (itemId, size) => {
        return wishlistItems[itemId]?.[size] ? true : false;
    }

    const getWishlistCount = () => {
        let count = 0;
        for (const itemId in wishlistItems) {
            count += Object.keys(wishlistItems[itemId]).length;
        }
        return count;
    }

    // 获取销售数据
    const fetchSalesData = async (currentProducts) => {
        const productsToUse = currentProducts || products;
        if (!productsToUse || productsToUse.length === 0) {
            console.log('No products available for fetching sales data');
            return;
        }

        try {
            const response = await axios.get(`${backendUrl}/api/order/sales-data`);
            if (response.data.success) {
                const newSalesData = response.data.salesData || {};
                setSalesData(newSalesData);
                console.log('Sales data loaded:', Object.keys(newSalesData).length);
                // 使用当前的产品数据更新Week's Winners
                updateWeeksWinners(productsToUse, newSalesData);
            } else {
                console.error('Failed to fetch sales data:', response.data.message);
                updateWeeksWinners(productsToUse, {});
            }
        } catch (error) {
            console.error('Error fetching sales data:', error);
            updateWeeksWinners(productsToUse, {});
        }
    };

    // 更新Week's Winners
    const updateWeeksWinners = (currentProducts, currentSalesData) => {
        const productsToUse = currentProducts || products;
        const salesDataToUse = currentSalesData || salesData;

        if (!productsToUse || productsToUse.length === 0) {
            console.log('No products available for Week\'s Winners');
            return;
        }
        
        try {
            // 为所有产品计算得分
            const productScores = productsToUse
                .filter(product => product.isActive !== false) // 只包含激活的产品
                .map(product => ({
                    product,
                    score: calculateProductScore(product, salesDataToUse)
                }))
                .sort((a, b) => b.score - a.score); // 按得分排序
            
            // 获取所有可用的产品
            const availableProducts = productScores.map(item => item.product);
            
            if (availableProducts.length === 0) {
                console.log('No available products after filtering');
                return;
            }
            
            // 创建winners数组，确保始终有5个产品
            const winners = [];
            for (let i = 0; i < 5 && i < availableProducts.length; i++) {
                winners.push(availableProducts[i]);
            }

            // 如果产品不足5个，循环使用已有产品
            while (winners.length < 5) {
                winners.push(availableProducts[winners.length % availableProducts.length]);
            }
            
            console.log('Setting Week\'s Winners:', winners.length, 'products');
            setWeeksWinners(winners);
        } catch (error) {
            console.error('Error updating Week\'s Winners:', error);
        }
    };

    // 计算商品得分
    const calculateProductScore = (product, currentSalesData) => {
        if (!product) return 0;
        
        let score = 0;
        const salesDataToUse = currentSalesData || salesData;
        
        try {
            // 1. 基础分数（所有产品都有10分基础分）
            score += 10;
            
            // 2. 销售数据（最高40分）
            const salesCount = salesDataToUse[product._id] || 0;
            score += Math.min(salesCount * 4, 40); // 每卖出一件加4分，最高40分
            
            // 3. 促销情况（最高30分）
            if (product.isOnPromotion && product.promotionPrice) {
                const discountPercent = (product.price - product.promotionPrice) / product.price;
                score += discountPercent * 30; // 最高30分
            }
            
            // 4. 库存情况（最高20分）
            const totalStock = Object.values(product.sizes || {}).reduce((a, b) => a + b, 0);
            if (totalStock > 0) {
                if (totalStock <= 20) {
                    score += 20; // 库存较少加20分
                } else if (totalStock <= 50) {
                    score += 15; // 库存适中加15分
                } else {
                    score += 10; // 库存充足加10分
                }
            }
        } catch (error) {
            console.error('Error calculating score for product:', product._id, error);
            return 10; // 如果计算出错，返回基础分
        }
        
        return score;
    };

    // 在订单完成后更新Week's Winners
    const updateAfterOrder = async () => {
        try {
            await fetchSalesData();
        } catch (error) {
            console.error('Error updating after order:', error);
        }
    };

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart,setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token,
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        getUserWishlist,
        isInWishlist,
        getWishlistCount,
        checkWishlistPromotion,
        weeksWinners,
        updateAfterOrder,
        handleSearch,
        updateUserPreferences
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;