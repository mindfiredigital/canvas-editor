export function printImageBase64(
  base64List: string[],
  width: number,
  height: number
) {
  console.log('printImageBase64')

  const iframe = document.createElement('iframe')
  // off-screen rendering
  iframe.style.visibility = 'hidden'
  iframe.style.position = 'absolute'
  iframe.style.left = '0'
  iframe.style.top = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  document.body.append(iframe)
  const contentWindow = iframe.contentWindow!
  const doc = contentWindow.document
  doc.open()
  const container = document.createElement('div')
  base64List.forEach(base64 => {
    const image = document.createElement('img')
    image.style.width = `${width}px`
    image.style.height = `${height}px`
    image.src = base64
    container.append(image)
  })
  const style = document.createElement('style')
  const stylesheet = `*{margin:0;padding:0;}`
  style.append(document.createTextNode(stylesheet))
  setTimeout(() => {
    doc.write(`${style.outerHTML}${container.innerHTML}`)
    contentWindow.print()
    doc.close()
    // remove iframe
    window.addEventListener(
      'mouseover',
      () => {
        iframe?.remove()
      },
      {
        once: true
      }
    )
  })
}
