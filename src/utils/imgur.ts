export function fixImgurLink(url: string): string {
  if (!url) return url
  if (!url.includes('imgur.com')) return url
  
  if (url.includes('i.imgur.com') && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return url
  
  const match = /imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]{5,})/i.exec(url)
  if (match && match[1]) {
    return `https://i.imgur.com/${match[1]}.png`
  }
  
  return url
}
