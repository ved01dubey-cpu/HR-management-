const products = [
    {
        id: 1,
        name: "Premium Wireless Headphones",
        price: 199.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
        rating: 4.8,
        description: "Experience crystal clear sound with our flagship wireless headphones. Features active noise cancellation and 40-hour battery life.",
        isFeatured: true
    },
    {
        id: 2,
        name: "Minimalist Leather Watch",
        price: 129.50,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
        rating: 4.5,
        description: "A timeless design with a premium leather strap. Perfect for both formal and casual occasions.",
        isFeatured: true
    },
    {
        id: 3,
        name: "Smart Fitness Tracker",
        price: 79.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=800",
        rating: 4.2,
        description: "Track your steps, heart rate, and sleep with precision. Water-resistant and 10-day battery life.",
        isFeatured: false
    },
    {
        id: 4,
        name: "Ergonomic Office Chair",
        price: 249.00,
        category: "Home",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800", // placeholder
        rating: 4.7,
        description: "Ultimate comfort for long working hours. Adjustable height, lumbar support, and breathable mesh.",
        isFeatured: true
    },
    {
        id: 5,
        name: "Portable Bluetooth Speaker",
        price: 59.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1608156639585-34a0a56ee6c9?auto=format&fit=crop&q=80&w=800",
        rating: 4.4,
        description: "Big sound in a compact size. Waterproof design perfect for outdoor adventures.",
        isFeatured: false
    },
    {
        id: 6,
        name: "Designer Sunglasses",
        price: 150.00,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800",
        rating: 4.6,
        description: "Polarized lenses with a stylish frame. UV400 protection for your eyes.",
        isFeatured: false
    },
    {
        id: 7,
        name: "Mechanical Gaming Keyboard",
        price: 119.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800",
        rating: 4.9,
        description: "RGB lighting with tactile mechanical switches. Built for performance and durability.",
        isFeatured: true
    },
    {
        id: 8,
        name: "Compact Coffee Maker",
        price: 89.00,
        category: "Home",
        image: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800",
        rating: 4.3,
        description: "Brew your favorite coffee in minutes. Sleek design that fits any kitchen space.",
        isFeatured: false
    },
    {
        id: 9,
        name: "Professional Camera Lens",
        price: 899.00,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80&w=800",
        rating: 4.8,
        description: "High-quality optics for stunning photography. f/1.8 aperture for beautiful bokeh.",
        isFeatured: false
    },
    {
        id: 10,
        name: "Leather Messenger Bag",
        price: 135.00,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800",
        rating: 4.5,
        description: "Handcrafted from genuine leather. Spacious enough for a 15-inch laptop and essentials.",
        isFeatured: false
    },
    {
        id: 11,
        name: "Ceramic Table Lamp",
        price: 65.00,
        category: "Home",
        image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800",
        rating: 4.4,
        description: "Soft ambient lighting for your bedroom or living room. Modern geometric design.",
        isFeatured: false
    },
    {
        id: 12,
        name: "Ultra-Light Running Shoes",
        price: 110.00,
        category: "Sports",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
        rating: 4.6,
        description: "Breathable mesh upper with responsive cushioning. Engineered for speed and comfort.",
        isFeatured: true
    }
];

// Exporting for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
}
