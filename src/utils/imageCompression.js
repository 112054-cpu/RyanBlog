import imageCompression from 'browser-image-compression'
import heic2any from 'heic2any'

// 將 HEIC 轉換為 JPEG
async function convertHeicToJpeg(file) {
  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    })
    
    // 如果返回數組，取第一個
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
    
    // 創建新的 File 對象
    return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now()
    })
  } catch (error) {
    console.error('HEIC 轉換失敗:', error)
    throw new Error('HEIC 格式轉換失敗，請重試或使用其他格式')
  }
}

export async function compressImage(file) {
  let processFile = file
  
  // 如果是 HEIC 格式，先轉換為 JPEG
  if (file.type === 'image/heic' || file.type === 'image/heif' || 
      file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    console.log('檢測到 HEIC 格式，正在轉換為 JPG...')
    processFile = await convertHeicToJpeg(file)
  }
  
  const options = {
    maxSizeMB: 1,                    // 壓縮到 1MB 以下
    maxWidthOrHeight: 1920,          // 最大寬高 1920px
    useWebWorker: true,              // 使用 Web Worker 提升性能
    fileType: 'image/jpeg',          // 強制轉換為 JPG 格式
    initialQuality: 0.8              // 初始品質 80%
  }

  try {
    console.log(`原始檔案: ${file.name}, 大小: ${(file.size / 1024 / 1024).toFixed(2)}MB, 格式: ${file.type}`)
    
    const compressedFile = await imageCompression(processFile, options)
    
    // 確保檔案名稱以 .jpg 結尾
    const originalName = file.name.split('.')[0]
    const newFile = new File([compressedFile], `${originalName}.jpg`, { 
      type: 'image/jpeg',
      lastModified: Date.now()
    })
    
    console.log(`壓縮後: ${newFile.name}, 大小: ${(newFile.size / 1024 / 1024).toFixed(2)}MB`)
    
    return newFile
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error('圖片壓縮失敗，請重試')
  }
}

export function validateImageFile(file) {
  const validTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
    'image/gif', 'image/bmp', 'image/heic', 'image/heif'
  ]
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic', '.heif']
  const maxSize = 50 * 1024 * 1024 // 50MB before compression
  
  // 檢查文件類型或副檔名（因為某些瀏覽器可能無法正確識別 HEIC 的 MIME type）
  const fileName = file.name.toLowerCase()
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
  const hasValidType = validTypes.includes(file.type)
  
  if (!hasValidType && !hasValidExtension) {
    throw new Error('請上傳圖片檔案（支援 JPG、PNG、WebP、GIF、BMP、HEIC 格式，將自動轉為 JPG）')
  }
  
  if (file.size > maxSize) {
    throw new Error('圖片檔案過大（超過 50MB），請選擇較小的檔案')
  }
  
  return true
}
