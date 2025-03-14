import React, { useEffect, useState } from 'react';
import './UserOrders.css';
import { format } from 'date-fns';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  // 获取订单列表
  const fetchOrders = async () => {
    try {
      const url = selectedStatus 
        ? `/api/user/orders?status=${selectedStatus}`
        : '/api/user/orders';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取订单详情
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      const data = await response.json();
      setSelectedOrder(data.order);
      setOrderItems(data.items);
    } catch (error) {
      console.error('获取订单详情失败:', error);
    }
  };

  // 取消订单
  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/user/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        await fetchOrders();
        if (selectedOrder?._id === orderId) {
          await fetchOrderDetails(orderId);
        }
      }
    } catch (error) {
      console.error('取消订单失败:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const formatDate = (date) => {
    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: '待处理',
      shipped: '已发货',
      cancelled: '已取消',
      hold: '处理中'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="user-orders">
      <div className="orders-header">
        <h2>我的订单</h2>
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="status-filter"
        >
          <option value="">全部订单</option>
          <option value="pending">待处理</option>
          <option value="shipped">已发货</option>
          <option value="cancelled">已取消</option>
          <option value="hold">处理中</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          暂无订单记录
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-number">
                  订单号：{order.orderNumber}
                </div>
                <div className="order-status">
                  {getStatusText(order.status)}
                </div>
              </div>
              
              <div className="order-info">
                <div>下单时间：{formatDate(order.orderDate)}</div>
                <div>订单金额：￥{order.totalAmount.toFixed(2)}</div>
              </div>

              <div className="order-actions">
                <button 
                  className="detail-btn"
                  onClick={() => fetchOrderDetails(order._id)}
                >
                  查看详情
                </button>
                {(order.status === 'pending' || order.status === 'hold') && (
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      if (window.confirm('确定要取消该订单吗？')) {
                        cancelOrder(order._id);
                      }
                    }}
                  >
                    取消订单
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="order-detail-modal">
          <div className="modal-content">
            <h3>订单详情</h3>
            <button 
              className="close-btn"
              onClick={() => setSelectedOrder(null)}
            >
              ×
            </button>
            
            <div className="order-detail-info">
              <p><strong>订单号：</strong>{selectedOrder.orderNumber}</p>
              <p><strong>下单时间：</strong>{formatDate(selectedOrder.orderDate)}</p>
              <p><strong>订单状态：</strong>{getStatusText(selectedOrder.status)}</p>
              <p><strong>订单金额：</strong>￥{selectedOrder.totalAmount.toFixed(2)}</p>
              
              {selectedOrder.shipmentDate && (
                <p><strong>发货时间：</strong>{formatDate(selectedOrder.shipmentDate)}</p>
              )}
              {selectedOrder.cancelDate && (
                <p><strong>取消时间：</strong>{formatDate(selectedOrder.cancelDate)}</p>
              )}
              {selectedOrder.holdDate && (
                <p><strong>处理说明：</strong>{selectedOrder.holdReason}</p>
              )}
            </div>

            <div className="order-items">
              <h4>订单商品</h4>
              <div className="items-list">
                {orderItems.map(item => (
                  <div key={item._id} className="item-card">
                    <div className="item-info">
                      <h5>{item.productID.name}</h5>
                      {item.skuID && (
                        <p className="sku-info">
                          规格：{item.skuID.sku_code}
                        </p>
                      )}
                      <p className="price-info">
                        单价：￥{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="item-quantity">
                      ×{item.quantity}
                    </div>
                    <div className="item-subtotal">
                      ￥{item.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="status-history">
              <h4>订单状态记录</h4>
              <ul>
                {selectedOrder.statusHistory.map((history, index) => (
                  <li key={index}>
                    {formatDate(history.date)} - {getStatusText(history.status)}
                    {history.note && ` (${history.note})`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders; 