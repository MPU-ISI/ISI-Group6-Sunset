// UserOrders.jsx - 用户订单页面
import React, { useContext, useEffect } from 'react';
import { OrderContext } from '../../Context/OrderContext';
import OrderDetailModal from './OrderDetailModal.jsx';
import './UserOrders.css';
import { currency } from '../../App';

const UserOrders = () => {
  const { 
    orders, 
    loading, 
    error, 
    fetchOrders, 
    fetchOrderById, 
    selectedOrder, 
    setSelectedOrder, 
    showOrderModal, 
    setShowOrderModal,
    cancelOrder
  } = useContext(OrderContext);

  // 页面加载时获取订单
  useEffect(() => {
    fetchOrders();
  }, []);

  // 处理查看订单详情
  const handleViewOrder = async (orderID) => {
    const success = await fetchOrderById(orderID);
    if (success) {
      setShowOrderModal(true);
    }
  };

  // 处理取消订单
  const handleCancelOrder = async (orderID) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await cancelOrder(orderID);
    }
  };

  // 获取状态名称
  const getStatusName = (statusID, orderType) => {
    if (orderType === 'tangible') {
      switch(statusID) {
        case 1: return 'Pending';
        case 2: return 'Shipped';
        case 3: return 'Cancelled';
        case 4: return 'Hold';
        default: return `Status ${statusID}`;
      }
    } else {
      switch(statusID) {
        case 1: return 'Pending';
        case 2: return 'Ticket-Issued';
        case 3: return 'Complete';
        case 4: return 'Refunded';
        default: return `Status ${statusID}`;
      }
    }
  };

  // 获取状态类名
  const getStatusClass = (statusID, orderType) => {
    if (orderType === 'tangible') {
      switch(statusID) {
        case 1: return 'status-pending';
        case 2: return 'status-shipped';
        case 3: return 'status-cancelled';
        case 4: return 'status-hold';
        default: return '';
      }
    } else {
      switch(statusID) {
        case 1: return 'status-pending';
        case 2: return 'status-issued';
        case 3: return 'status-complete';
        case 4: return 'status-refunded';
        default: return '';
      }
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 检查订单是否可取消
  const canCancelOrder = (order) => {
    if (order.orderType === 'tangible') {
      return order.statusID === 1 || order.statusID === 4; // Pending or Hold
    } else {
      return order.statusID === 1; // Only Pending for virtual products
    }
  };

  // 渲染订单项目列表
  const renderOrderItems = (items) => {
    if (!items || items.length === 0) return <p>No items in this order</p>;
    
    const displayItems = items.slice(0, 2); // 只显示前两项
    const remainingCount = items.length - 2;
    
    return (
      <div className="order-items-preview">
        {displayItems.map((item, index) => (
          <div key={index} className="order-item-preview">
            {item.productName} x{item.quantity}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="more-items">+{remainingCount} more</div>
        )}
      </div>
    );
  };

  return (
    <div className="user-orders-container">
      <h1>My Orders</h1>
      
      {error && (
        <div className="orders-error-message">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="orders-loading">
          <p>Loading your orders...</p>
        </div>
      ) : (
        <>
          {orders.length > 0 ? (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.orderID} className="order-card">
                  <div className="order-header">
                    <div className="order-number">
                      <span>Order #</span>
                      <strong>{order.orderID}</strong>
                    </div>
                    <div className={`order-status ${getStatusClass(order.statusID, order.orderType)}`}>
                      {getStatusName(order.statusID, order.orderType)}
                    </div>
                  </div>
                  
                  <div className="order-details">
                    <div className="order-detail-row">
                      <span>Date:</span>
                      <span>{formatDate(order.orderDate)}</span>
                    </div>
                    <div className="order-detail-row">
                      <span>Items:</span>
                      {renderOrderItems(order.items)}
                    </div>
                    <div className="order-detail-row">
                      <span>Total:</span>
                      <strong>{currency}{order.totalAmount.toFixed(2)}</strong>
                    </div>
                    <div className="order-detail-row">
                      <span>Type:</span>
                      <span>{order.orderType === 'tangible' ? 'Physical Products' : 'Digital Products'}</span>
                    </div>
                  </div>
                  
                  <div className="order-actions">
                    <button 
                      className="view-order-btn"
                      onClick={() => handleViewOrder(order.orderID)}
                    >
                      View Details
                    </button>
                    
                    {canCancelOrder(order) && (
                      <button 
                        className="cancel-order-btn"
                        onClick={() => handleCancelOrder(order.orderID)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-orders-message">
              <p>You don't have any orders yet.</p>
              <p>Start shopping to place your first order!</p>
            </div>
          )}
        </>
      )}
      
      {/* 订单详情弹窗 */}
      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowOrderModal(false)}
          onCancel={handleCancelOrder}
        />
      )}
    </div>
  );
};

export default UserOrders;