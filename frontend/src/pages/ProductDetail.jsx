<div className="product-price">
  {product.isOnPromotion && product.promotionPrice && product.promotionPrice < product.price ? (
    <div className="promo-price">
      <span className="original-price">${product.price}</span>
      <span className="current-price">${product.promotionPrice}</span>
      <span className="savings">
        Save ${(product.price - product.promotionPrice).toFixed(2)}
      </span>
    </div>
  ) : (
    <span className="price">${product.price}</span>
  )}
</div> 