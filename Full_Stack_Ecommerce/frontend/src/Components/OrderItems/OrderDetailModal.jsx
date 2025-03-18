// OrderDetailModal.jsx - 订单详情弹窗
import React from 'react';
import './OrderDetailModal.css';
import { currency } from '../../App';

const OrderDetailModal = ({ order, onClose, onCancel }) => {
  if (!order) return null;

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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

  // 检查订单是否可取消
  const canCancelOrder = (order) => {
    if (order.orderType === 'tangible') {
      return order.statusID === 1 || order.statusID === 4; // Pending or Hold
    } else {
      return order.statusID === 1; // Only Pending for virtual products
    }
  };

  // 渲染状态历史
  const renderStatusHistory = () => {
    if (!order.statusHistory || order.statusHistory.length === 0) {
      return <p>No status history available</p>;
    }

    return (
      <div className="status-history">
        {order.statusHistory.map((status, index) => (
          <div key={index} className="status-history-item">
            <div className="status-history-date">
              {formatDate(status.date)}
            </div>
            <div className={`status-history-name ${getStatusClass(status.statusID, order.orderType)}`}>
              {getStatusName(status.statusID, order.orderType)}
            </div>
            {status.comment && (
              <div className="status-history-comment">
                {status.comment}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="order-modal-overlay">
      <div className="order-modal-content">
        <div className="order-modal-header">
          <h2>Order #{order.orderID}</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="order-modal-body">
          <div className="order-modal-section">
            <h3>Order Information</h3>
            <div className="order-info-grid">
              <div className="order-info-item">
                <span className="info-label">Order Date:</span>
                <span className="info-value">{formatDate(order.orderDate)}</span>
              </div>
              <div className="order-info-item">
                <span className="info-label">Status:</span>
                <span className={`info-value status-tag ${getStatusClass(order.statusID, order.orderType)}`}>
                  {getStatusName(order.statusID, order.orderType)}
                </span>
              </div>
              <div className="order-info-item">
                <span className="info-label">Order Type:</span>
                <span className="info-value">{order.orderType === 'tangible' ? 'Physical Products' : 'Digital Products'}</span>
              </div>
              <div className="order-info-item">
                <span className="info-label">Total Amount:</span>
                <span className="info-value total-value">{currency}{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="order-modal-section">
            <h3>Items</h3>
            <div className="order-items-table">
              <div className="order-items-header">
                <div className="item-cell">Product</div>
                <div className="item-cell">Unit Price</div>
                <div className="item-cell">Quantity</div>
                <div className="item-cell">Subtotal</div>
              </div>
              {order.items && order.items.map((item, index) => (
                <div key={index} className="order-items-row">
                  <div className="item-cell item-name">
                    <div>{item.productName}</div>
                    {item.sku_id && (
                      <div className="item-sku">SKU: {item.sku_id}</div>
                    )}
                  </div>
                  <div className="item-cell">{currency}{item.price.toFixed(2)}</div>
                  <div className="item-cell">{item.quantity}</div>
                  <div className="item-cell">{currency}{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="order-modal-section">
            <h3>Shipping Address</h3>
            <div className="address-box">
              {order.address}
            </div>
          </div>
          
          {/* 若有跟踪号则显示 */}
          {order.trackingNumber && (
            <div className="order-modal-section">
              <h3>Tracking Information</h3>
              <div className="tracking-box">
                <strong>Tracking Number:</strong> {order.trackingNumber}
              </div>
            </div>
          )}
          
          {/* 若有电子票据信息则显示 */}
          {order.ticketInfo && (
            <div className="order-modal-section">
              <h3>Ticket Information</h3>
              <div className="ticket-box">
                {order.ticketInfo}
              </div>
            </div>
          )}
          
          {/* 状态历史 */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="order-modal-section">
              <h3>Status History</h3>
              {renderStatusHistory()}
            </div>
          )}
        </div>
        
        <div className="order-modal-footer">
          {canCancelOrder(order) && (
            <button 
              className="cancel-order-modal-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this order?')) {
                  onCancel(order.orderID);
                  onClose();
                }
              }}
            >
              Cancel Order
            </button>
          )}
          <button className="close-order-modal-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;