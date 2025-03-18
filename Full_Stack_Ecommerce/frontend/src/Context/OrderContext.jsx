import React, { createContext, useEffect, useState } from 'react';
import { backend_url } from '../App';

export const OrderContext = createContext({
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  showOrderModal: false,
  fetchOrders: () => Promise.resolve(false),
  fetchOrderById: () => Promise.resolve(false),
  createOrder: () => Promise.resolve(false),
  cancelOrder: () => Promise.resolve(false),
  setShowOrderModal: () => {},
  setSelectedOrder: () => {}
});

const OrderContextProvider = (props) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // 获取用户所有订单
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取认证令牌
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        console.log("No auth token found, can't fetch orders");
        setOrders([]);
        setLoading(false);
        return false;
      }
      
      const response = await fetch(`${backend_url}/api/orders/myorders`, {
        headers: {
          'auth-token': token
        }
      });
      
      if (!response.ok) {
        console.error("Error fetching orders, status:", response.status);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
        return true;
      } else {
        setError(data.message || "Failed to fetch orders");
        return false;
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message || "An error occurred while fetching orders");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 获取特定订单详情
  const fetchOrderById = async (orderID) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        console.log("No auth token found, can't fetch order details");
        return false;
      }
      
      const response = await fetch(`${backend_url}/api/orders/detail/${orderID}`, {
        headers: {
          'auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedOrder(data.order);
        return true;
      } else {
        setError(data.message || "Failed to fetch order details");
        return false;
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError(error.message || "An error occurred while fetching order details");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 创建新订单
  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        console.log("No auth token found, can't create order");
        return false;
      }
      
      const response = await fetch(`${backend_url}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 添加新订单到订单列表
        await fetchOrders();
        // 设置为选中的订单以便显示详情
        setSelectedOrder(data.order);
        return true;
      } else {
        setError(data.message || "Failed to create order");
        return false;
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setError(error.message || "An error occurred while creating the order");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 取消订单
  const cancelOrder = async (orderID, comment = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        console.log("No auth token found, can't cancel order");
        return false;
      }
      
      const response = await fetch(`${backend_url}/api/orders/cancel/${orderID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ comment })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 更新订单列表和当前选中的订单
        await fetchOrders();
        // 如果当前有选中的订单且是被取消的订单，则更新它
        if (selectedOrder && selectedOrder.orderID === orderID) {
          setSelectedOrder(data.order);
        }
        return true;
      } else {
        setError(data.message || "Failed to cancel order");
        return false;
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      setError(error.message || "An error occurred while cancelling the order");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 初始加载订单
  useEffect(() => {
    fetchOrders();
  }, []);

  const contextValue = {
    orders,
    selectedOrder,
    loading,
    error,
    showOrderModal,
    fetchOrders,
    fetchOrderById,
    createOrder,
    cancelOrder,
    setShowOrderModal,
    setSelectedOrder
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {props.children}
    </OrderContext.Provider>
  );
};

export default OrderContextProvider;