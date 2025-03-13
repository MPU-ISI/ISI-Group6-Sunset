import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { backend_url } from '../App'
import Breadcrums from '../Components/Breadcrums/Breadcrums'
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox'
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay'
import { ShopContext } from '../Context/ShopContext'

const Product = () => {
  const { products } = useContext(ShopContext);
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 首先尝试从上下文中获取基本产品信息
    const basicProduct = products.find((e) => e.id === Number(productId));

    // 然后从API获取详细信息，包括属性、选项和SKUs
    fetch(`${backend_url}/api/products/detail/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product details:", err);
        // 如果API调用失败，至少使用基本产品信息
        if (basicProduct) {
          setProduct(basicProduct);
        }
        setLoading(false);
      });
  }, [products, productId]);

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  return product ? (
    <div>
      <Breadcrums product={product} />
      <ProductDisplay product={product} />
      <DescriptionBox description={product.description} />
    </div>
  ) : <div>Product not found</div>;
}

export default Product