import React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Minus, Plus, ShoppingCart, Zap, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Rating } from "../components/common/Rating";
import { ProductCarousel } from "../components/product/ProductCarousel";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductsContext";
import { LoadingScreen } from "../components/common/LoadingScreen";

export function ProductPage() {
  const { productId } = useParams();
  const { products, isLoading, error } = useProducts();
  const product = products.find((item) => item.id === productId);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("");

  useEffect(() => {
    setColor(product?.colors?.[0] || "");
    setSelectedImage(0);
  }, [product]);

  if (isLoading) return <LoadingScreen label="Loading product" />;
  if (error) return <div className="empty-page"><h2>Could not load product</h2><p>{error}</p><Link to="/">Back to shopping</Link></div>;
  if (!product) return <div className="empty-page"><span>😕</span><h2>Product not found</h2><Link to="/">Back to shopping</Link></div>;

  const buyNow = () => {
    addToCart(product, quantity);
    navigate("/checkout");
  };

  return (
    <div className="product-page">
      <div className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={14}/><span>{product.category}</span><ChevronRight size={14}/><strong>{product.name}</strong></div>
      <section className="product-detail">
        <div className="gallery">
          <div className="thumbnail-list">{product.images.map((image, i) => <button className={selectedImage === i ? "selected" : ""} key={image} onClick={() => setSelectedImage(i)}><img src={image} alt={`${product.name} view ${i + 1}`}/></button>)}</div>
          <div className="main-product-image"><img src={product.images[selectedImage]} alt={product.name}/><span>{product.discount}% OFF</span></div>
        </div>
        <div className="product-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <Rating value={product.rating} reviews={product.reviews}/>
          <div className="detail-price"><strong>₹{product.price.toLocaleString("en-IN")}</strong><del>₹{product.originalPrice.toLocaleString("en-IN")}</del><b>{product.discount}% OFF</b></div>
          <p className="price-note">Inclusive of all taxes • Free delivery above ₹2,499</p>

          <div className="highlight-list">{product.highlights.map((highlight) => <div key={highlight}><ShieldCheck size={16}/>{highlight}</div>)}</div>

          <div className="option-block"><label>Color: <b>{color}</b></label><div className="color-options">{product.colors.map((item) => <button key={item} title={item} className={color === item ? "selected" : ""} onClick={() => setColor(item)}>{item}</button>)}</div></div>
          <div className="purchase-row"><div className="qty-control large"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus/></button><b>{quantity}</b><button onClick={() => setQuantity(quantity + 1)}><Plus/></button></div><button className="secondary-button" onClick={() => addToCart(product, quantity)}><ShoppingCart size={18}/> Add to Cart</button><button className="primary-button" onClick={buyNow}><Zap size={18}/> Buy Now</button></div>

          <div className="delivery-strip"><div><Truck size={19}/><span><b>Free Delivery</b><small>On eligible orders</small></span></div><div><RotateCcw size={19}/><span><b>7 Days Returns</b><small>Easy returns & refunds</small></span></div><div><ShieldCheck size={19}/><span><b>1 Year Warranty</b><small>Brand warranty included</small></span></div></div>
        </div>
      </section>

      <section className="description-panel"><h2>Product Description</h2><p>Designed for comfortable everyday listening, the {product.name} combines dependable performance with a sleek design. Enjoy clear audio, easy connectivity and features made for your daily routine.</p><h3>Why you'll love it</h3><ul>{product.highlights.map((x) => <li key={x}>{x}</li>)}</ul></section>

     {/* <section className="product-section"><div className="section-header"><div><h2>You may also like</h2><p>More picks from Bcomkart</p></div></div><ProductCarousel products={products.filter((p) => p.id !== product.id).slice(0, 5)}/></section>
     */}
    </div>
  );
}
