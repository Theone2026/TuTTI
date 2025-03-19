import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ProductItem = ({ name, price }) => {
    return (_jsxs("div", { className: "product-item", children: [_jsx("img", { src: "https://via.placeholder.com/150", alt: name }), _jsx("h3", { children: name }), _jsx("p", { children: price })] }));
};
export default ProductItem;
