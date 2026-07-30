import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import HightLightCard from '../assets/Components/HightLightCard'
import API_BASE from '../config'

const Men = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const subcategory = searchParams.get('subcategory');

  useEffect(() => {
    document.title = subcategory 
      ? `Men's ${subcategory} — Devclothes` 
      : "Men's Collection — Devclothes";
  }, [subcategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (response.ok) {
          const data = await response.json();
          // Filter products for Men category, and optionally by subcategory
          const filtered = data.filter(p => {
            const matchesCategory = p.category === 'Men';
            const matchesSubcategory = !subcategory || (p.collection && p.collection.toLowerCase() === subcategory.toLowerCase());
            return matchesCategory && matchesSubcategory;
          });
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching men products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [subcategory]);

  return (
    <div className='pt-[64px] font-roboto w-[80%] max-md:w-full mx-auto pb-16'>
      <div className='w-full text-3xl font-bold mb-8 px-1.5 py-2.5 border-b border-gray-100'>
        Men Collection {subcategory ? `— ${subcategory === 'Tops' ? 'Tops & T-Shirts' : subcategory === 'Hoodies' ? 'Hoodies & Sweatshirts' : subcategory === 'Pants' ? 'Pants & Jeans' : subcategory === 'Jackets' ? 'Jackets & Outerwear' : subcategory}` : ''}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20 text-gray-500">Loading products...</div>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No products found in this category.</p>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6 px-4'>
          {products.map((prod) => (
            <HightLightCard
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
  )
}

export default Men