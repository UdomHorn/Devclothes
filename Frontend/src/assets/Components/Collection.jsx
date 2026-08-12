import React from 'react'
import { getOptimizedImageUrl } from '../../utils/cloudinary'

const Collection = ({ src, title, loading = "lazy", fetchPriority }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div className="w-full">
      <div className="w-full aspect-[4/5] bg-gray-100 flex items-center justify-center overflow-hidden">
        {src ? (
          <img
            ref={imgRef}
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
          <div className="w-full h-full bg-gradient-to-tr from-neutral-950 to-neutral-800 flex flex-col items-center justify-center p-4 text-center select-none">
            <span className="text-sm font-light tracking-widest font-inter text-neutral-200 uppercase mb-1">DEVCLOTHES</span>
            <span className="text-[10px] text-neutral-500 tracking-wider font-roboto uppercase">No Banner Image Set</span>
          </div>
        ) : (
          <span className="text-gray-450 font-medium">Loading Banner...</span>
        )}
      </div>
      <div className='flex justify-center items-center text-center mt-4 w-full'>
        <div className='w-full font-roboto font-bold text-sm sm:text-base py-3 border border-neutral-800 bg-white text-black hover:bg-black hover:text-white transition-all duration-300 tracking-wide'>{title}</div>
      </div>
    </div>
  )
}

export default Collection