import React from 'react'
import { getOptimizedImageUrl } from '../../utils/cloudinary'

const Collection = ({ src, title, loading = "lazy", fetchPriority }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <div className="w-full">
      <div className="w-full aspect-[4/5] bg-gray-100 flex items-center justify-center overflow-hidden">
        {src ? (
          <img
            src={getOptimizedImageUrl(src, { width: 800, height: 1000, crop: 'fill' })}
            alt={title}
            loading={loading}
            fetchPriority={fetchPriority}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-[500ms] ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : src === "" ? (
          <span className="text-gray-300 font-semibold tracking-wider text-xs uppercase">No Image Set</span>
        ) : (
          <span className="text-gray-400 font-medium">Loading Banner...</span>
        )}
      </div>
      <div className='flex justify-center items-center text-center mt-4 w-full'>
        <div className='w-full font-roboto font-bold text-sm sm:text-base py-3 border border-neutral-800 bg-white text-black hover:bg-black hover:text-white transition-all duration-300 tracking-wide'>{title}</div>
      </div>
    </div>
  )
}

export default Collection