// src/App.tsx
import React from "react";
import Header from "./components/Header";
import ProductList from "./components/ProductList";
import Footer from "./components/Footer";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <ProductList />
      </main>
      <Footer />
    </div>
  );
};

export default App;