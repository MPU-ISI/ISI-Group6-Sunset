import React, { useEffect, useState } from 'react'
import './RelatedProducts.css'
import Item from '../Item/Item'
import { backend_url } from '../../App';

const RelatedProducts = ({category, id}) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 更新为新的API路径
    fetch(`${backend_url}/api/products/related`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({category: category}),
    })
    .then((res) => res.json())
    .then((data) => {
      setRelated(data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching related products:", err);
      setLoading(false);
    });
  }, [category]);

  if (loading) {
    return <div className="loading">Loading related products...</div>;
  }

  return (
    <div className='relatedproducts'>
      <h1>Related Products</h1>
      <hr />
      <div className="relatedproducts-item">
        {related.filter(item => item.id !== Number(id)).map((item, index) => (
          <Item 
            key={index} 
            id={item.id} 
            name={item.name} 
            image={item.image}  
            new_price={item.new_price} 
            old_price={item.old_price}
            isConfigurable={item.isConfigurable}
          />
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts