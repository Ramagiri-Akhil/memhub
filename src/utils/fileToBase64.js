// Reads a File or Blob and resolves to a "data:<mime>;base64,..." string.
// Use this to send an uploaded image to the backend in a JSON body.
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () =>
      reject(reader.error || new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
