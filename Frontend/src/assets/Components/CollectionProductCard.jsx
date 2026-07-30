import React from 'react'
import { Link } from 'react-router-dom'
import { getOptimizedImageUrl } from '../../utils/cloudinary'

const CollectionProductCard = ({ page, src, price, title, product, loading = "lazy", fetchPriority }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <div className="group relative flex flex-col bg-white">
      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50 border border-gray-100/50">
        <Link to={page} className="block w-full h-full">
          <img
            src={getOptimizedImageUrl(src, { width: 500, height: 667, crop: 'fill' })}
            srcSet={`
              ${getOptimizedImageUrl(src, { width: 300, height: 400, crop: 'fill' })} 300w,
              ${getOptimizedImageUrl(src, { width: 500, height: 667, crop: 'fill' })} 500w,
              ${getOptimizedImageUrl(src, { width: 800, height: 1067, crop: 'fill' })} 800w
            `}
            sizes="(max-width: 640px) 300px, (max-width: 1024px) 500px, 800px"
            alt={title}
            loading={loading}
            fetchPriority={fetchPriority}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover object-top transition-all duration-[600ms] ease-out group-hover:scale-[1.01] ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </Link>
      </div>

      {/* Ultra-minimalist Details Footer */}
      <div className="mt-3 text-left space-y-0.5 px-1.5">
        <h4 className="text-[12px] font-light text-neutral-800 tracking-wide font-roboto">
          {product?.name || title}
        </h4>
        <span className="text-[11px] font-light text-neutral-450 font-roboto block">
          {price}
        </span>
      </div>
    </div>
  )
}

export default CollectionProductCard
