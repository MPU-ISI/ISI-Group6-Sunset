import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { assets } from '../assets/assets';
import axios from 'axios';
import Title from '../components/Title';

// 订单状态选项，与管理员页面保持一致
const ORDER_STATUS_OPTIONS = [
  'Order Placed',
  'Packing',
  'Shipped',
  'Out for delivery',
  'Delivered'
];

const OrderDetail = () => {
  const { orderId } = useParams();
  const { backendUrl, token, currency } = useContext(ShopContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post(
          `${backendUrl}/api/order/userOrderDetail`,
          { orderId },
          { headers: { token } }
        );

        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          navigate('/orders');
        }
      } catch (error) {
        console.log(error);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, token, navigate, backendUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <img src={assets.empty_cart} alt="No Order" className="w-24 h-24 opacity-50" />
        <p className="text-gray-500 text-lg">{t('orderNotFound')}</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          {t('backToOrders')}
        </button>
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

  // 将英文状态翻译为用户语言
  const translateStatus = (status) => {
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
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl">
          <Title text1={t('orderDetails')} text2={''} />
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors text-sm"
        >
          {t('backToOrders')}
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold">{t('orderNumber')}: #{order.orderId || order._id}</h2>
            <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${getStatusClass(order.status || 'Order Placed')}`}>
            <span className="font-medium">{translateStatus(order.status || 'Order Placed')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">{t('orderSummary')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('items')}</span>
                <span>{order.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('paymentMethod')}</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('paymentStatus')}</span>
                <span className={order.payment ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                  {order.payment ? t('paid') : t('pending')}
                </span>
              </div>
              {order.statusChangeDate && (
                <div className="flex justify-between">
                  <span>{t('lastUpdated')}</span>
                  <span>{new Date(order.statusChangeDate).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>{t('total')}</span>
                <span>{currency}{order.amount}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">{t('shippingAddress')}</h3>
            <div className="space-y-1">
              <p className="font-medium">{order.address.firstName} {order.address.lastName}</p>
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.state}, {order.address.zipcode}
              </p>
              <p>{order.address.country}</p>
              <p className="mt-2">{t('phone')}: {order.address.phone}</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold border-b pb-2 mb-4">{t('orderedItems')}</h3>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-[1fr_3fr_1fr] gap-4 items-center">
              <div className="flex justify-center">
                <img
                  src={item.image && item.image.length > 0 ? item.image[0] : assets.parcel_icon}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
              </div>
              <div>
                <h4 className="text-lg font-medium">{item.name}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>{t('size')}: {item.size}</p>
                  <p>{t('price')}: {currency}{item.price}</p>
                  <p>{t('quantity')}: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{currency}{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t mt-8 pt-4 text-right">
          <div className="space-y-2">
            <p>
              <span className="text-gray-600">{t('subtotal')}:</span>{' '}
              <span className="font-medium">{currency}{order.amount}</span>
            </p>
            <p className="text-xl">
              <span>{t('total')}:</span>{' '}
              <span className="font-bold">{currency}{order.amount}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 