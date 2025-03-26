import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

// Define order status progress sequence
const ORDER_STATUS_SEQUENCE = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for delivery",
  "Delivered"
];

const OrderDetail = ({ token }) => {
  const { orderId } = useParams();
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
          `${backendUrl}/api/order/detail`,
          { orderId },
          { headers: { token } }
        );

        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          toast.error(response.data.message || 'Failed to get order details');
          navigate('/orders');
        }
      } catch (error) {
        console.log(error);
        toast.error('Error fetching order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, token, navigate]);

  const statusHandler = async (event) => {
    try {
      const currentDate = new Date();
      const response = await axios.post(
        backendUrl + '/api/order/status',
        {
          orderId: order._id,
          status: event.target.value,
          statusChangeDate: currentDate
        },
        { headers: { token } }
      );

      if (response.data.success) {
        // Update local order status
        setOrder({ ...order, status: event.target.value, statusChangeDate: currentDate });
        toast.success('Order status updated');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  // Function to get available status options based on current status
  const getAvailableStatusOptions = (currentStatus) => {
    if (!currentStatus) return ORDER_STATUS_SEQUENCE;
    
    const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);
    if (currentIndex === -1) return ORDER_STATUS_SEQUENCE;
    
    // Return current status and all statuses that come after it
    return ORDER_STATUS_SEQUENCE.slice(currentIndex);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-bold">Order not found</h3>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Order Details</h2>
        <button
          onClick={() => navigate('/orders')}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Back to Orders
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Order Information</h3>
            <p><span className="font-medium">Order ID:</span> #{order.orderId || order._id}</p>
            <p><span className="font-medium">Status:</span> {order.status}</p>
            <p><span className="font-medium">Order Date:</span> {new Date(order.date).toLocaleString()}</p>
            {order.statusChangeDate && (
              <p><span className="font-medium">Status Updated:</span> {new Date(order.statusChangeDate).toLocaleString()}</p>
            )}
            <p><span className="font-medium">Order Amount:</span> {currency}{order.amount}</p>
            <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
            <p><span className="font-medium">Payment Status:</span> {order.payment ? 'Paid' : 'Pending'}</p>
            
            <div className="mt-4">
              <label className="font-medium">Update Order Status:</label>
              <select
                onChange={statusHandler}
                value={order.status}
                className="ml-2 p-2 border rounded"
              >
                {getAvailableStatusOptions(order.status).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
            <p><span className="font-medium">Recipient:</span> {order.address.firstName} {order.address.lastName}</p>
            <p><span className="font-medium">Phone:</span> {order.address.phone}</p>
            <p><span className="font-medium">Address:</span> {order.address.street}</p>
            <p><span className="font-medium">City:</span> {order.address.city}</p>
            <p><span className="font-medium">State/Province:</span> {order.address.state}</p>
            <p><span className="font-medium">Country:</span> {order.address.country}</p>
            <p><span className="font-medium">Zip Code:</span> {order.address.zipcode}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4 border-t pt-6">Order Items ({order.items.length})</h3>
        <div className="grid gap-4">
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
                <p>Size: {item.size}</p>
                <p>Price: {currency}{item.price}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{currency}{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t mt-6 pt-4 text-right">
          <p className="text-lg">Total: <span className="font-bold">{currency}{order.amount}</span></p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 