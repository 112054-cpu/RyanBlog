export function shareOnFacebook(url, title) {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

export function shareOnTwitter(url, title) {
  const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

export function shareOnLinkedIn(url, title) {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

export async function shareViaWebShare(url, title, text) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: text,
        url: url
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(url)
    alert('連結已複製到剪貼簿')
  }
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('連結已複製到剪貼簿')
  }).catch(err => {
    console.error('Failed to copy:', err)
  })
}
