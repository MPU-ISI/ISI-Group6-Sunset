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
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('')
    const navigate = useNavigate();


    const addToCart = async (itemId, size) => {
        if (!size) {
            toast.error('请选择产品尺码');
            return;
        }

        // 检查库存
        const product = products.find(p => p._id === itemId);
        if (!product) {
            toast.error('产品不存在');
            return;
        }

        if (!product.sizes || product.sizes[size] <= 0) {
            toast.error('所选尺码已售罄');
            return;
        }

        let cartData = structuredClone(cartItems);
        const currentQuantity = cartData[itemId]?.[size] || 0;
        
        // 检查购物车中已有数量+1是否超过库存
        if (currentQuantity + 1 > product.sizes[size]) {
            toast.error(`该尺码库存不足，当前库存: ${product.sizes[size]}`);
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
                // 只更新购物车，不更新库存
                await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } });
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    const getCartCount = () => {
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
        // 找到当前商品
        const product = products.find(p => p._id === itemId);
        if (!product) {
            toast.error('产品不存在');
            return;
        }

        // 获取当前购物车中的数量
        let cartData = structuredClone(cartItems);
        const currentQuantity = cartData[itemId]?.[size] || 0;
        
        // 如果要减少数量
        if (quantity < currentQuantity) {
            cartData[itemId][size] = quantity;
            setCartItems(cartData);

            if (token) {
                try {
                    // 只更新购物车
                    await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } });
                } catch (error) {
                    console.log(error);
                    toast.error(error.message);
                }
            }
        } 
        // 如果要增加数量
        else if (quantity > currentQuantity) {
            // 检查是否有足够的库存
            if (!product.sizes || product.sizes[size] < (quantity - currentQuantity)) {
                toast.error(`库存不足，当前可用: ${product.sizes?.[size] || 0}`);
                return;
            }

            cartData[itemId][size] = quantity;
            setCartItems(cartData);

            if (token) {
                try {
                    // 只更新购物车
                    await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } });
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
                            totalAmount += itemInfo.price * cartItems[items][item];
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
                setProducts(response.data.products.reverse())
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
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
        getProductsData()
    }, [])

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
        }
        if (token) {
            getUserCart(token)
        }
    }, [token])

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart,setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;