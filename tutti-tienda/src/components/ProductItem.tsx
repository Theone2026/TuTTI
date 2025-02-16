// src/components/ProductItem.tsx
import React from "react";

interface ProductItemProps {
  name: string;
  price: string;
}

const ProductItem: React.FC<ProductItemProps> = ({ name, price }) => {
  return (
    <div className="product-item">
      <img src="https://via.placeholder.com/150" alt={name} />
      <h3>{name}</h3>
      <p>{price}</p>
    </div>
  );
};

export default ProductItem;