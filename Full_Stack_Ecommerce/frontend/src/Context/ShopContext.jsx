import React, { createContext, useEffect, useState } from "react";
import { backend_url } from "../App";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartData, setCartData] = useState({
    cart: [],
    cartCount: 0,
    cartTotal: 0
  });

  // 初始化空购物车
  const getDefaultCart = () => {
    return {};
  };

  const [cartItems, setCartItems] = useState(getDefaultCart());

  // 加载产品和购物车数据
  useEffect(() => {
    // 加载所有产品
    fetch(`${backend_url}/api/products/all`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });

    // 如果用户已登录，获取购物车数据
    if (localStorage.getItem("auth-token")) {
      fetchCartData();
    }
  }, []);

  // 获取购物车数据的函数
  const fetchCartData = () => {
    fetch(`${backend_url}/api/cart`, {
      method: 'GET',
      headers: {
        'auth-token': `${localStorage.getItem("auth-token")}`,
        'Content-Type': 'application/json',
      }
    })
      .then((resp) => resp.json())
      .then((data) => {
        // 处理后端返回的购物车数据
        if (data.success) {
          setCartData(data);
          
          // 将购物车数据转换为本地格式
          const cartItemsMap = {};
          data.cart.forEach(item => {
            const key = item.sku_id ? `${item.productID}-${item.sku_id}` : `${item.productID}`;
            cartItemsMap[key] = item.quantity;
          });
          setCartItems(cartItemsMap);
        } else {
          console.error("Error fetching cart:", data.error);
        }
      })
      .catch(err => console.error("Error fetching cart:", err));
  };

  // 修改获取购物车总金额的函数，支持SKU价格
  const getTotalCartAmount = () => {
    // 如果后端已经计算了总金额，直接使用
    if (cartData.cartTotal) {
      return cartData.cartTotal;
    }
    
    // 否则手动计算
    let totalAmount = 0;
    for (const itemKey in cartItems) {
      if (cartItems[itemKey] > 0) {
        try {
          // 处理带有SKU的商品
          if (itemKey.includes('-')) {
            const [productId, skuId] = itemKey.split('-');
            // 获取产品信息
            const product = products.find(p => p.id === Number(productId));
            
            if (product && product.skus) {
              // 找到匹配的SKU
              const sku = product.skus.find(s => s.sku_id === Number(skuId));
              if (sku) {
                totalAmount += cartItems[itemKey] * sku.price;
              }
            }
          } else {
            // 处理普通商品
            const itemInfo = products.find((product) => product.id === Number(itemKey));
            if (itemInfo) {
              totalAmount += cartItems[itemKey] * itemInfo.new_price;
            }
          }
        } catch (error) {
          console.error("Error calculating cart amount:", error);
        }
      }
    }
    return totalAmount;
  };

  // 修改获取购物车总数量的函数
  const getTotalCartItems = () => {
    // 如果后端已经计算了商品数量，直接使用
    if (cartData.cartCount !== undefined) {
      return cartData.cartCount;
    }
    
    // 否则手动计算
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];
      }
    }
    return totalItem;
  };

  // 修改添加到购物车的函数，支持SKU
  const addToCart = (productId, quantity = 1, skuId = null) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please Login");
      return;
    }

    const itemKey = skuId ? `${productId}-${skuId}` : `${productId}`;
    
    // 立即更新本地状态以提供响应式体验
    setCartItems((prev) => {
      const currentQuantity = prev[itemKey] || 0;
      return { 
        ...prev, 
        [itemKey]: currentQuantity + quantity 
      };
    });

    // 然后发送请求到后端
    if (localStorage.getItem("auth-token")) {
      fetch(`${backend_url}/api/cart/add`, {
        method: 'POST',
        headers: {
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId, // 使用匹配后端的参数名
          quantity, 
          skuId 
        }),
      })
      .then(response => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          return response.text().then(text => {
            console.log("Error response:", text);
            throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("Success response:", data);
        fetchCartData();
      })
      .catch(err => {
        console.error("Error adding to cart:", err);
        // 如果发生错误，回滚本地状态
        setCartItems((prev) => {
          const currentQuantity = prev[itemKey] || 0;
          return { 
            ...prev, 
            [itemKey]: Math.max(0, currentQuantity - quantity)
          };
        });
      });
    }
  };

  // 修改从购物车移除的函数，支持SKU
  const removeFromCart = (productId, skuId = null) => {
    if (!localStorage.getItem("auth-token")) {
      return;
    }
    
    const itemKey = skuId ? `${productId}-${skuId}` : `${productId}`;
    
    // 如果商品不在购物车中，不执行任何操作
    if (!cartItems[itemKey] || cartItems[itemKey] <= 0) {
      return;
    }
    
    // 立即更新本地状态以提供响应式体验
    setCartItems((prev) => {
      const currentQuantity = prev[itemKey] || 0;
      return { 
        ...prev, 
        [itemKey]: Math.max(0, currentQuantity - 1)
      };
    });

    // 然后发送请求到后端
    if (localStorage.getItem("auth-token")) {
      fetch(`${backend_url}/api/cart/remove`, {
        method: 'POST',
        headers: {
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId, // 使用匹配后端的参数名
          skuId 
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // 更新购物车后重新获取完整购物车数据
        fetchCartData();
      })
      .catch(err => {
        console.error("Error removing from cart:", err);
        // 如果发生错误，回滚本地状态
        setCartItems((prev) => ({
          ...prev,
          [itemKey]: (prev[itemKey] || 0) + 1
        }));
      });
    }
  };

  // 更新购物车项数量的函数
  const updateCartItem = (cartItemId, quantity) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please Login");
      return;
    }

    fetch(`${backend_url}/api/cart/update`, {
      method: 'POST',
      headers: {
        'auth-token': `${localStorage.getItem("auth-token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        cartItemId, 
        quantity 
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // 更新购物车后重新获取完整购物车数据
      fetchCartData();
    })
    .catch(err => console.error("Error updating cart item:", err));
  };

  // 清空购物车的函数
  const clearCart = () => {
    if (!localStorage.getItem("auth-token")) {
      return;
    }

    fetch(`${backend_url}/api/cart/clear`, {
      method: 'POST',
      headers: {
        'auth-token': `${localStorage.getItem("auth-token")}`,
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // 清空本地购物车状态
      setCartItems(getDefaultCart());
      setCartData({
        cart: [],
        cartCount: 0,
        cartTotal: 0
      });
    })
    .catch(err => console.error("Error clearing cart:", err));
  };

  // 获取特定商品信息的辅助函数
  const getProductDetails = (productId, skuId = null) => {
    const product = products.find(p => p.id === Number(productId));
    
    if (!product) return null;
    
    if (skuId && product.isConfigurable) {
      const sku = product.skus?.find(s => s.sku_id === Number(skuId));
      if (sku) {
        return {
          ...product,
          currentPrice: sku.price,
          currentImage: sku.image_url || product.image,
          inventory: sku.quantity,
          inventoryStatus: sku.inventory_status
        };
      }
    }
    
    return {
      ...product,
      currentPrice: product.new_price,
      currentImage: product.image,
      inventoryStatus: "in_stock" // 默认状态
    };
  };

  const contextValue = { 
    products, 
    loading,
    getTotalCartItems, 
    cartItems, 
    addToCart, 
    removeFromCart, 
    getTotalCartAmount,
    getProductDetails,
    updateCartItem,
    clearCart,
    cartData
  };
  
  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;