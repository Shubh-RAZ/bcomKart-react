export const products = [
  {
    id: "sony-wh-ch520",
    name: "Sony WH-CH520",
    description: "Wireless headphones with rich sound and all-day comfort.",
    category: "Electronics",
    price: 2990,
    originalPrice: 4990,
    rating: 4.5,
    reviews: 128,
    discount: 40,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=85"
    ],
    highlights: ["50 Hours Battery Life", "Bluetooth 5.2 Connectivity", "Lightweight & Comfortable", "Built-in Microphone"],
    colors: ["Black", "Blue", "Pink"]
  },
  {
    id: "boat-airdopes-141",
    name: "boAt Airdopes 141",
    description: "True wireless earbuds with punchy bass and low-latency mode.",
    category: "Electronics",
    price: 1299,
    originalPrice: 2499,
    rating: 4.4,
    reviews: 842,
    discount: 48,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85",
    images: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85"],
    highlights: ["42 Hours Playback", "Low Latency Mode", "IPX4 Water Resistant", "Fast Charging"],
    colors: ["Black", "White"]
  },
  {
    id: "fire-boltt-ninja-3",
    name: "Fire-Boltt Ninja 3",
    description: "Smart watch with health tracking, sports modes and a bright display.",
    category: "Electronics",
    price: 1599,
    originalPrice: 3999,
    rating: 4.2,
    reviews: 391,
    discount: 60,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85"],
    highlights: ["1.69-inch Display", "Multiple Sports Modes", "Heart Rate Tracking", "7-Day Battery"],
    colors: ["Black", "Silver"]
  },
  {
    id: "zebronics-juke-bar",
    name: "Zebronics Juke BAR 100",
    description: "Compact soundbar designed for immersive TV and music audio.",
    category: "Home & Kitchen",
    price: 2499,
    originalPrice: 4499,
    rating: 4.1,
    reviews: 184,
    discount: 44,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=85",
    images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=85"],
    highlights: ["Powerful Bass", "Bluetooth Connectivity", "Multiple Inputs", "Compact Design"],
    colors: ["Black"]
  },
  {
    id: "puma-unisex-backpack",
    name: "Puma Unisex Backpack",
    description: "Stylish and durable everyday backpack with roomy storage.",
    category: "Fashion",
    price: 999,
    originalPrice: 2199,
    rating: 4.3,
    reviews: 256,
    discount: 55,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85"],
    highlights: ["Water Resistant", "Padded Laptop Sleeve", "Multiple Compartments", "Lightweight"],
    colors: ["Black", "Blue"]
  },
  {
    id: "nike-air-max",
    name: "Nike Air Max",
    description: "Everyday sneakers with responsive cushioning and a modern silhouette.",
    category: "Sports",
    price: 4299,
    originalPrice: 6999,
    rating: 4.6,
    reviews: 521,
    discount: 39,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85"],
    highlights: ["Responsive Cushioning", "Breathable Upper", "Durable Outsole", "Everyday Comfort"],
    colors: ["Red", "Black", "White"]
  }
];

export const categories = ["All", "Electronics", "Fashion", "Home & Kitchen", "Sports"];

export const getProductById = (id) => products.find((product) => product.id === id);
