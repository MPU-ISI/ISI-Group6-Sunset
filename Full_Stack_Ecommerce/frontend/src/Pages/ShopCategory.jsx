import React, { useEffect, useState } from "react";
import "./CSS/ShopCategory.css";
import dropdown_icon from '../Components/Assets/dropdown_icon.png'
import Item from "../Components/Item/Item";
import { Link } from "react-router-dom";
import { backend_url } from '../App';

const ShopCategory = (props) => {
  const [allproducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    // 更新为新的API路径
    fetch(`${backend_url}/api/products/all`) 
      .then((res) => res.json()) 
      .then((data) => {
        setAllProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);
    
  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  // 过滤当前类别的产品
  const categoryProducts = allproducts.filter(item => item.category === props.category);
    
  return (
    <div className="shopcategory">
      <img src={props.banner} className="shopcategory-banner" alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1 - {categoryProducts.length}</span> out of {categoryProducts.length} Products
        </p>
        <div className="shopcategory-sort">Sort by <img src={dropdown_icon} alt="" /></div>
      </div>
      <div className="shopcategory-products">
        {categoryProducts.map((item, i) => (
          <Item 
            id={item.id} 
            key={i} 
            name={item.name} 
            image={item.image} 
            new_price={item.new_price} 
            old_price={item.old_price}
            isConfigurable={item.isConfigurable}
          />
        ))}
      </div>
      {categoryProducts.length > 0 ? (
        <div className="shopcategory-loadmore">
          <Link to="/" style={{ textDecoration: 'none' }}>Explore More</Link>
        </div>
      ) : (
        <div className="no-products">No products found in this category</div>
      )}
    </div>
  );
};

export default ShopCategory;