import imageCompression from 'browser-image-compression'

export async function compressImage(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    throw error
  }
}

export function validateImageFile(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB before compression
  
  if (!validTypes.includes(file.type)) {
    throw new Error('只支援 JPG、PNG 或 WebP 格式的圖片')
  }
  
  if (file.size > maxSize) {
    throw new Error('圖片大小不能超過 10MB')
  }
  
  return true
}
