/**
 * Optimizes a Cloudinary image URL by injecting quality, format, and size parameters.
 * If the URL is not a Cloudinary URL, it returns the original URL.
 * 
 * @param {string} url - The original image URL
 * @param {object} options - Optimization options
 * @param {number} [options.width] - Desired width of the image
 * @param {number} [options.height] - Desired height of the image
 * @param {string} [options.crop] - Crop strategy (defaults to 'fill')
 * @returns {string} - The optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return url;
  }

  // Find where '/upload/' is in the URL
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const beforeUpload = url.substring(0, uploadIndex + 8); // includes '/upload/'
  const afterUpload = url.substring(uploadIndex + 8);

  const transforms = ['f_auto', 'q_auto'];

  const { width, height, crop = 'fill' } = options;

  if (width) {
    transforms.push(`w_${width}`);
  }
  if (height) {
    transforms.push(`h_${height}`);
  }
  if (width || height) {
    transforms.push(`c_${crop}`);
  }

  return `${beforeUpload}${transforms.join(',')}/${afterUpload}`;
};
