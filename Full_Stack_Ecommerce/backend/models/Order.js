// models/Order.js
const mongoose = require('mongoose');

// 订单项子模式
const OrderItemSchema = new mongoose.Schema({
  productID: { type: Number, required: true },
  productName: { type: String, required: true },
  productType: { type: String, enum: ['tangible', 'virtual'], default: 'tangible' },
  sku_id: { type: Number },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

// 状态历史记录子模式
const StatusHistorySchema = new mongoose.Schema({
  statusID: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  comment: { type: String }
});

// 主订单模式
const OrderSchema = new mongoose.Schema({
  orderID: { type: Number, required: true, unique: true },
  userID: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  orderType: { type: String, enum: ['tangible', 'virtual'], default: 'tangible' },
  statusID: { type: Number, default: 1 }, // 1=待处理(Pending)
  statusHistory: [StatusHistorySchema],
  address: { type: String, required: true },
  trackingNumber: { type: String },
  ticketInfo: { type: String } // 用于虚拟产品的电子票据信息
}, { timestamps: true });

// 虚拟属性：获取状态名称
OrderSchema.virtual('statusName').get(function() {
  const tangibleStatuses = {
    1: 'Pending',
    2: 'Shipped',
    3: 'Cancelled',
    4: 'Hold'
  };
  
  const virtualStatuses = {
    1: 'Pending',
    2: 'Ticket-Issued',
    3: 'Complete',
    4: 'Refunded'
  };
  
  if (this.orderType === 'virtual') {
    return virtualStatuses[this.statusID] || 'Unknown';
  }
  
  return tangibleStatuses[this.statusID] || 'Unknown';
});

// 添加方法：检查状态变更是否有效
OrderSchema.methods.canChangeStatus = function(newStatusID) {
  const currentStatusID = this.statusID;
  
  if (this.orderType === 'tangible') {
    // 实体产品的状态流转规则
    const validTransitions = {
      1: [2, 3, 4],  // Pending -> Shipped, Cancelled, Hold
      2: [],          // Shipped -> 无法变更
      3: [],          // Cancelled -> 无法变更
      4: [2, 3]       // Hold -> Shipped, Cancelled
    };
    
    if (validTransitions[currentStatusID] && Array.isArray(validTransitions[currentStatusID])) {
      return validTransitions[currentStatusID].includes(newStatusID);
    }
    return false;
  } else {
    // 虚拟产品的状态流转规则
    const validTransitions = {
      1: [2, 3, 4],  // Pending -> Ticket-Issued, Complete, Refunded
      2: [3, 4],      // Ticket-Issued -> Complete, Refunded
      3: [],          // Complete -> 无法变更
      4: []           // Refunded -> 无法变更
    };
    
    if (validTransitions[currentStatusID] && Array.isArray(validTransitions[currentStatusID])) {
      return validTransitions[currentStatusID].includes(newStatusID);
    }
    return false;
  }
};

// 添加方法：添加状态历史记录
OrderSchema.methods.addStatusHistory = function(statusID, comment = '') {
  const newStatus = {
    statusID,
    date: new Date(),
    comment
  };
  
  if (!this.statusHistory) {
    this.statusHistory = [];
  }
  
  this.statusHistory.push(newStatus);
  this.statusID = statusID;
};

// 确保虚拟属性在JSON中可见
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', OrderSchema);