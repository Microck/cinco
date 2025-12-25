export async function uploadToCatbox(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch image')
  
  const buffer = await response.arrayBuffer()
  const blob = new Blob([buffer])
  
  const formData = new FormData()
  formData.append('reqtype', 'fileupload')
  formData.append('fileToUpload', blob, 'image.png')
  
  const uploadResponse = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
  })
  
  if (!uploadResponse.ok) throw new Error('Failed to upload to Catbox')
  
  const result = await uploadResponse.text()
  if (!result.startsWith('https://')) throw new Error(`Catbox error: ${result}`)
  
  return result.trim()
}
