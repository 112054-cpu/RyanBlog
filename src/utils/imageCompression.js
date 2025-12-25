import imageCompression from 'browser-image-compression'

export async function compressImage(file) {
  const options = {
    maxSizeMB: 1,                    // 壓縮到 1MB 以下
    maxWidthOrHeight: 1920,          // 最大寬高 1920px
    useWebWorker: true,              // 使用 Web Worker 提升性能
    fileType: 'image/jpeg',          // 強制轉換為 JPG 格式
    initialQuality: 0.8              // 初始品質 80%
  }

  try {
    console.log(`原始檔案: ${file.name}, 大小: ${(file.size / 1024 / 1024).toFixed(2)}MB, 格式: ${file.type}`)
    
    const compressedFile = await imageCompression(file, options)
    
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
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
  const maxSize = 50 * 1024 * 1024 // 50MB before compression (放寬限制，因為會自動壓縮)
  
  if (!validTypes.includes(file.type)) {
    throw new Error('只支援圖片格式（JPG、PNG、WebP、GIF、BMP）')
  }
  
  if (file.size > maxSize) {
    throw new Error('圖片大小不能超過 50MB')
  }
  
  return true
}
