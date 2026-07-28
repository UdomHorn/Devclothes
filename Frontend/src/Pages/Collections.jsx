import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CollectionProductCard from '../assets/Components/CollectionProductCard';
import API_BASE from '../config';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const collectionConfig = {
  spring: {
    title: 'Spring Collection',
    description: 'A curated collection of fresh styles and transitioning layers, designed for the warming season with lightweight materials and clean designs.',
    fallbackBanner: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop'
  },
  summer: {
    title: 'Summer Collection',
    description: 'A curated collection of lightweight essentials and timeless silhouettes, designed with modern simplicity and effortless comfort in mind.',
    fallbackBanner: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop'
  },
  fall: {
    title: 'Fall Collection',
    description: 'Cozy knits, deep tones, and structured outerwear. A perfect curation for cooler breezes, combining rich texture and classic comfort.',
    fallbackBanner: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop'
  },
  winter: {
    title: 'Winter Collection',
    description: 'Warm insulated garments, premium parkas, and protective knitwear. Build your cold-weather defense without compromising on style.',
    fallbackBanner: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop'
  }
};

const Collections = () => {
  const [searchParams] = useSearchParams();
  const currentCollection = searchParams.get('type') || 'summer';
  
  const [collectionBanner, setCollectionBanner] = useState(null);
  const [products, setProducts] = useState([]);

  const config = collectionConfig[currentCollection.toLowerCase()] || collectionConfig.summer;

  useEffect(() => {
    document.title = `${config.title} — Devclothes`;
  }, [config]);

  // Fetch Banner for active collection category
  useEffect(() => {
    setCollectionBanner(null);
    const fetchCategoryBanners = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/banners/categories`);
        if (response.ok) {
          const data = await response.json();
          const targetKey = `collections_${currentCollection.toLowerCase()}`;
          const activeBanner = data.find(b => b.category.toLowerCase() === targetKey);
          setCollectionBanner(activeBanner ? activeBanner.imageUrl : "");
        } else {
          setCollectionBanner("");
        }
      } catch (err) {
        console.error('Failed to fetch category banners:', err);
        setCollectionBanner("");
      }
    };
    fetchCategoryBanners();
  }, [currentCollection]);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (prod) => prod.category === 'Collection' && prod.collection && prod.collection.toLowerCase() === currentCollection.toLowerCase()
  );

  return (
    <div className="pt-24 pb-20 font-roboto min-h-screen bg-white">
      {/* Dynamic Collection Campaign Banner */}
      <div className="w-full max-w-6xl mx-auto px-6 min-h-[calc(100vh-96px)] grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center py-10">
        {/* Left Side: Collection Title */}
        <div className="w-full md:col-span-5 flex flex-col items-start justify-center text-left order-2 md:order-1">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 tracking-wide font-inter uppercase leading-none">
            {config.title}
          </h1>
        </div>

        {/* Right Side: Portrait Image Campaign Lookbook */}
        <div className="w-full md:col-span-7 flex items-center justify-center md:justify-end order-1 md:order-2">
          <div className="w-full max-w-[420px] aspect-[3/4] overflow-hidden bg-neutral-50 border border-neutral-100 shadow-md relative">
            {collectionBanner === null ? (
              <div className="w-full h-full bg-neutral-100 animate-pulse flex items-center justify-center text-xs font-semibold text-gray-400">Loading Banner...</div>
            ) : (
              <img
                src={getOptimizedImageUrl(collectionBanner || config.fallbackBanner, { width: 800, height: 1067, crop: 'fill' })}
                alt={config.title}
                className="w-full h-full object-cover object-top"
                loading="eager"
                fetchPriority="high"
              />
            )}
          </div>
        </div>
      </div>

      {/* Collection Essentials Divider */}
      <div id="collection-essentials" className="w-full max-w-6xl mx-auto px-6 mt-16 mb-8">
        <h3 className="text-xs font-bold text-gray-900 tracking-widest uppercase border-b border-gray-150 pb-4">
          Collection Essentials
        </h3>
      </div>

      {/* Products Grid */}
      <div className="w-full max-w-6xl mx-auto px-6">
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No products found in the {config.title} yet. Add products to this collection in the admin panel.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => (
              <CollectionProductCard
                key={prod.id}
                product={prod}
                page={`/product/${prod.code || prod.id}`}
                src={prod.images && prod.images[0]}
                price={`$${prod.price.toFixed(2)}`}
                title={prod.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
