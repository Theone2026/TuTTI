import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ProductItem from "./ProductItem";
const ProductList = () => {
    return (_jsxs("div", { className: "product-list", children: [_jsx(ProductItem, { name: "Producto 1", price: "UYU 1000" }), _jsx(ProductItem, { name: "Producto 2", price: "UYU 1500" }), _jsx(ProductItem, { name: "Producto 3", price: "UYU 800" }), _jsx(ProductItem, { name: "Producto 4", price: "UYU 1200" })] }));
};
export default ProductList;
