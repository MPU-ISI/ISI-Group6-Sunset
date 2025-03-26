import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useLanguage } from '../context/LanguageContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import axios from 'axios';
import { Link } from 'react-router-dom';

// 订单状态选项，与管理员页面保持一致
const ORDER_STATUS_OPTIONS = [
  'Order Placed',
  'Packing',
  'Shipped',
  'Out for delivery',
  'Delivered'
];

const Orders = () => {
  const { backendUrl, token, currency, navigate } = useContext(ShopContext);
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [availableStatuses, setAvailableStatuses] = useState(['all']);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadOrderData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${backendUrl}/api/order/userorders`,
          { userId: 'dummy' }, // userId在后端通过token获取
          { headers: { token } }
        );

        if (response.data.success) {
          // 按日期排序，最新的在前面
          const sortedOrders = response.data.orders.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
          
          // 获取所有可用的状态
          const statuses = new Set(['all']);
          
          // 添加用户订单中的所有状态
          sortedOrders.forEach(order => {
            if (order.status) {
              statuses.add(order.status);
            }
          });
          
          // 添加所有标准状态选项（如果用户订单中没有）
          ORDER_STATUS_OPTIONS.forEach(status => {
            statuses.add(status);
          });
          
          setAvailableStatuses(Array.from(statuses));
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [backendUrl, token, navigate]);

  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus));
    }
  }, [selectedStatus, orders]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <img src={assets.empty_cart} alt="No Orders" className="w-24 h-24 opacity-50" />
        <p className="text-gray-500 text-lg">{t('noOrders')}</p>
        <Link
          to="/collection"
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
      case 'Out for delivery':
        return 'bg-blue-100 text-blue-800';
      case 'Packing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Order Placed':
        return 'bg-purple-100 text-purple-800';
      case 'Processing':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusButtonClass = (status) => {
    if (status === selectedStatus) {
      return 'bg-black text-white';
    }
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };

  // 将英文状态翻译为用户语言
  const translateStatus = (status) => {
    if (status === 'all') {
      return t('allOrders');
    }
    
    const statusTranslations = {
      'Order Placed': t('orderPlaced'),
      'Packing': t('packing'),
      'Shipped': t('shipped'),
      'Out for delivery': t('outForDelivery'),
      'Delivered': t('delivered'),
      'Processing': t('processing')
    };
    
    return statusTranslations[status] || status;
  };

  return (
    <div className="border-t pt-10 pb-16">
      <div className="text-2xl mb-6">
        <Title text1={t('myOrders')} text2={''} />
      </div>

      {/* 状态筛选器 */}
      <div className="mb-8">
        <h3 className="text-sm text-gray-500 mb-2">{t('filterByStatus')}:</h3>
        <div className="flex flex-wrap gap-2">
          {availableStatuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${getStatusButtonClass(status)}`}
            >
              {translateStatus(status)}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-500">{t('noOrdersWithStatus')}</p>
          <button 
            onClick={() => setSelectedStatus('all')}
            className="mt-4 px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors"
          >
            {t('showAllOrders')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white border rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <div>
                  <h3 className="text-md font-semibold">{t('orderNumber')}: #{order.orderId || order._id}</h3>
                  <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div className={`px-4 py-1 rounded-full ${getStatusClass(order.status || 'Order Placed')}`}>
                  <span className="text-sm font-medium">{translateStatus(order.status || 'Order Placed')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6">
                <div className="flex flex-row md:flex-col">
                  {/* 显示订单中前三个商品的图片 */}
                  <div className="flex md:justify-center">
                    {order.items.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={item.image && item.image.length > 0 ? item.image[0] : assets.parcel_icon}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded border"
                            />
                            {idx === 2 && order.items.length > 3 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                <span className="text-white text-sm font-medium">+{order.items.length - 3}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('orderSummary')}</p>
                      <p className="text-sm">
                        {t('items')}: <span className="font-medium">{order.items.length}</span>
                      </p>
                      <p className="text-sm">
                        {t('total')}: <span className="font-medium">{currency}{order.amount}</span>
                      </p>
                      <p className="text-sm">
                        {t('paymentMethod')}: <span className="font-medium">{order.paymentMethod}</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">{t('shippingAddress')}</p>
                      <p className="text-sm font-medium">
                        {order.address.firstName} {order.address.lastName}
                      </p>
                      <p className="text-sm overflow-hidden text-ellipsis">
                        {order.address.street}, {order.address.city}
                      </p>
                      <p className="text-sm">
                        {order.address.state}, {order.address.zipcode}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      to={`/order/${order._id}`}
                      className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors"
                    >
                      {t('viewDetails')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
