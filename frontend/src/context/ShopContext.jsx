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