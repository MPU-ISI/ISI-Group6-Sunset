import React from 'react'
import './Sidebar.css'
import add_product_icon from '../Assets/Product_Cart.svg'
import list_product_icon from '../Assets/Product_list_icon.svg'
import order_icon from '../Assets/order_icon.svg'
import { Link } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to='/addproduct' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="" />
          <p>添加商品</p>
        </div>
      </Link>
      <Link to='/listproduct' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="" />
          <p>商品列表</p>
        </div>
      </Link>
      <Link to='/listorder' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={order_icon} alt="" />
          <p>订单管理</p>
        </div>
      </Link>
    </div>
  )
}

export default Sidebar
