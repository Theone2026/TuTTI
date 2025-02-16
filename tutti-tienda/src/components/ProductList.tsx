// src/components/ProductList.tsx
import React from "react";
import ProductItem from "./ProductItem";

const ProductList: React.FC = () => {
  return (
    <div className="product-list">
      <ProductItem name="Producto 1" price="UYU 1000" />
      <ProductItem name="Producto 2" price="UYU 1500" />
      <ProductItem name="Producto 3" price="UYU 800" />
      <ProductItem name="Producto 4" price="UYU 1200" />
    </div>
  );
};

export default ProductList;