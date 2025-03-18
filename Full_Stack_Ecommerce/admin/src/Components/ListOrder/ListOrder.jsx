import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ListOrder.css";
import { backend_url, currency } from "../../App";
import cross_icon from '../Assets/cross_icon.png';

const ListOrder = () => {
  // 状态管理
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 筛选状态
  const [orderType, setOrderType] = useState("");
  const [statusID, setStatusID] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // 排序状态
  const [sortField, setSortField] = useState("orderDate");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // 状态选项
  const [statusOptions, setStatusOptions] = useState({
    tangible: [
      { statusID: 1, statusName: "Pending" },
      { statusID: 2, statusName: "Shipped" },
      { statusID: 3, statusName: "Cancelled" },
      { statusID: 4, statusName: "Hold" }
    ],
    virtual: [
      { statusID: 1, statusName: "Pending" },
      { statusID: 2, statusName: "Ticket-Issued" },
      { statusID: 3, statusName: "Complete" },
      { statusID: 4, statusName: "Refunded" }
    ]
  });

  // 获取订单列表
  const fetchOrders = async () => {
    setLoading(true);
    
    try {
      // 构建查询参数
      let queryParams = `?page=${currentPage}`;
      if (orderType) queryParams += `&orderType=${orderType}`;
      if (statusID) queryParams += `&statusID=${statusID}`;
      if (fromDate) queryParams += `&fromDate=${fromDate}`;
      if (toDate) queryParams += `&toDate=${toDate}`;
      queryParams += `&sortBy=${sortField}&order=${sortDirection}`;
      
      const response = await fetch(`${backend_url}/api/orders/admin/all${queryParams}`, {
        headers: {
          'auth-token': localStorage.getItem('token')
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setError(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和筛选/排序变化时获取订单
  useEffect(() => {
    fetchOrders();
  }, [currentPage, orderType, statusID, fromDate, toDate, sortField, sortDirection]);

  // 处理排序
  const handleSort = (field) => {
    if (field === sortField) {
      // 切换排序方向
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // 设置新的排序字段
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // 重置筛选器
  const resetFilters = () => {
    setOrderType("");
    setStatusID("");
    setFromDate("");
    setToDate("");
    setSearchText("");
    setCurrentPage(1);
  };

  // 获取状态名称
  const getStatusName = (statusID, orderType) => {
    const statuses = orderType === "virtual" ? statusOptions.virtual : statusOptions.tangible;
    const status = statuses.find(s => s.statusID === statusID);
    return status?.statusName || `Status ${statusID}`;
  };

  // 获取状态类
  const getStatusClass = (statusID, orderType) => {
    if (orderType === "tangible") {
      switch(statusID) {
        case 1: return "status-pending";
        case 2: return "status-shipped";
        case 3: return "status-cancelled";
        case 4: return "status-hold";
        default: return "";
      }
    } else {
      switch(statusID) {
        case 1: return "status-pending";
        case 2: return "status-issued";
        case 3: return "status-complete";
        case 4: return "status-refunded";
        default: return "";
      }
    }
  };

  // 筛选和搜索订单
  const getFilteredOrders = () => {
    if (!searchText) return orders;
    
    const term = searchText.toLowerCase();
    
    return orders.filter(order => 
      order.orderID.toString().includes(term) ||
      order.items.some(item => item.productName.toLowerCase().includes(term)) ||
      getStatusName(order.statusID, order.orderType).toLowerCase().includes(term)
    );
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="list-order-container">
      <h1>Manage Orders</h1>
      
      {/* 筛选器 */}
      <div className="order-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Order Type</label>
            <select 
              value={orderType} 
              onChange={(e) => setOrderType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="tangible">Tangible Products</option>
              <option value="virtual">Virtual Products</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Status</label>
            <select 
              value={statusID} 
              onChange={(e) => setStatusID(e.target.value)}
            >
              <option value="">All Statuses</option>
              {orderType === "virtual" 
                ? statusOptions.virtual.map(status => (
                    <option key={status.statusID} value={status.statusID}>
                      {status.statusName}
                    </option>
                  ))
                : statusOptions.tangible.map(status => (
                    <option key={status.statusID} value={status.statusID}>
                      {status.statusName}
                    </option>
                  ))
              }
            </select>
          </div>
          
          <div className="filter-group">
            <label>From Date</label>
            <input 
              type="date" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>To Date</label>
            <input 
              type="date" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-row">
          <div className="search-group">
            <input 
              type="text" 
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by order ID, product name, or status..." 
            />
            {searchText && (
              <img
                src={cross_icon}
                alt="Clear"
                className="clear-search"
                onClick={() => setSearchText("")}
              />
            )}
          </div>
          
          <button className="reset-button" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>
      
      {/* 错误信息 */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {/* 加载中 */}
      {loading ? (
        <div className="loading">
          <p>Loading orders...</p>
        </div>
      ) : (
        <>
          {/* 订单表格 */}
          {filteredOrders.length > 0 ? (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("orderID")} className="sortable-header">
                      Order ID
                      {sortField === "orderID" && (
                        <span className="sort-arrow">
                          {sortDirection === "asc" ? " ▲" : " ▼"}
                        </span>
                      )}
                    </th>
                    <th onClick={() => handleSort("orderDate")} className="sortable-header">
                      Order Date
                      {sortField === "orderDate" && (
                        <span className="sort-arrow">
                          {sortDirection === "asc" ? " ▲" : " ▼"}
                        </span>
                      )}
                    </th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th onClick={() => handleSort("totalAmount")} className="sortable-header">
                      Total
                      {sortField === "totalAmount" && (
                        <span className="sort-arrow">
                          {sortDirection === "asc" ? " ▲" : " ▼"}
                        </span>
                      )}
                    </th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.orderID}>
                      <td>{order.orderID}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>User ID: {order.userID}</td>
                      <td>
                        <div className="order-items">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="order-item">
                              <span className="item-name">{item.productName}</span>
                              <span className="item-qty">x{item.quantity}</span>
                              <span className="item-price">{currency}{item.price}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="more-items">
                              +{order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="order-total">{currency}{order.totalAmount.toFixed(2)}</td>
                      <td>{order.orderType === "tangible" ? "Tangible" : "Virtual"}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.statusID, order.orderType)}`}>
                          {getStatusName(order.statusID, order.orderType)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link 
                            to={`/admin/orders/${order.orderID}`} 
                            className="view-button"
                          >
                            View
                          </Link>
                          <Link 
                            to={`/admin/orders/${order.orderID}/edit`}
                            className="edit-button"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-orders">
              <p>No orders found matching your criteria.</p>
            </div>
          )}
          
          {/* 分页 */}
          {filteredOrders.length > 0 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, array) => {
                  // 添加省略号
                  if (index > 0 && array[index - 1] !== page - 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className="pagination-ellipsis">...</span>
                        <button 
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? "active" : ""}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <button 
                      key={page} 
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "active" : ""}
                    >
                      {page}
                    </button>
                  );
                })
              }
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListOrder;