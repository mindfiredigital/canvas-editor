import { IElement } from '../../..'
import { EDITOR_PREFIX } from '../../../dataset/constant/Editor'
import { IEditorOption } from '../../../interface/Editor'
import { IElementPosition } from '../../../interface/Element'
import { IRowElement } from '../../../interface/Row'
import { Draw } from '../Draw'

export class HyperlinkParticle {
  private draw: Draw
  private options: Required<IEditorOption>
  private container: HTMLDivElement
  private hyperlinkPopupContainer: HTMLDivElement
  private hyperlinkDom: HTMLAnchorElement
  private hyperlinkPreviewDom: HTMLIFrameElement

  constructor(draw: Draw) {
    this.draw = draw
    this.options = draw.getOptions()
    this.container = draw.getContainer()
    const { hyperlinkPopupContainer, hyperlinkDom, hyperlinkPreviewDom } =
      this._createHyperlinkPopupDom()
    this.hyperlinkDom = hyperlinkDom
    this.hyperlinkPreviewDom = hyperlinkPreviewDom
    this.hyperlinkPopupContainer = hyperlinkPopupContainer
  }

  private _createHyperlinkPopupDom() {
    const hyperlinkPopupContainer = document.createElement('div')
    hyperlinkPopupContainer.classList.add(`${EDITOR_PREFIX}-hyperlink-popup`)
    const hyperlinkDom = document.createElement('a')
    hyperlinkDom.target = '_blank'
    hyperlinkDom.rel = 'noopener'
    hyperlinkPopupContainer.append(hyperlinkDom)
    const hyperlinkPreviewDom = document.createElement('iframe')
    hyperlinkPreviewDom.classList.add(`${EDITOR_PREFIX}-hyperlink-preview`)
    hyperlinkPreviewDom.setAttribute('frameborder', '0')
    hyperlinkPreviewDom.setAttribute('allow', 'autoplay; encrypted-media')
    hyperlinkPreviewDom.setAttribute('allowfullscreen', 'true')
    hyperlinkPreviewDom.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-presentation allow-popups'
    )
    hyperlinkPreviewDom.setAttribute('referrerpolicy', 'no-referrer')
    hyperlinkPreviewDom.setAttribute('loading', 'lazy')
    hyperlinkPreviewDom.setAttribute('title', 'Hyperlink preview')
    hyperlinkPreviewDom.style.display = 'none'
    hyperlinkPreviewDom.style.width = '320px'
    hyperlinkPreviewDom.style.height = '180px'
    hyperlinkPreviewDom.style.border = '0'
    hyperlinkPreviewDom.style.marginTop = '8px'
    hyperlinkPopupContainer.append(hyperlinkPreviewDom)
    this.container.append(hyperlinkPopupContainer)
    return { hyperlinkPopupContainer, hyperlinkDom, hyperlinkPreviewDom }
  }

  /** Convert a known video URL into an embeddable preview URL, else null. */
  private _getVideoEmbedUrl(url: string): string | null {
    try {
      const u = new URL(url)
      const host = u.hostname.replace(/^www\./, '')
      // YouTube
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        const v = u.searchParams.get('v')
        if (v) return `https://www.youtube.com/embed/${v}`
      }
      if (host === 'youtu.be') {
        const id = u.pathname.split('/').filter(Boolean)[0]
        if (id) return `https://www.youtube.com/embed/${id}`
      }
      // Google Drive: /file/d/<id>/...
      if (host === 'drive.google.com') {
        const m = u.pathname.match(/\/file\/d\/([^/]+)/)
        if (m) return `https://drive.google.com/file/d/${m[1]}/preview`
      }
      // Vimeo
      if (host === 'vimeo.com') {
        const id = u.pathname.split('/').filter(Boolean)[0]
        if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`
      }
    } catch {
      /* invalid URL */
    }
    return null
  }

  public drawHyperlinkPopup(element: IElement, position: IElementPosition) {
    const {
      coordinate: {
        leftTop: [left, top]
      },
      lineHeight
    } = position
    const height = this.draw.getHeight()
    const pageGap = this.draw.getPageGap()
    const preY = this.draw.getPageNo() * (height + pageGap)
    // 位置
    this.hyperlinkPopupContainer.style.display = 'block'
    this.hyperlinkPopupContainer.style.left = `${left}px`
    this.hyperlinkPopupContainer.style.top = `${top + preY + lineHeight}px`
    // 标签
    const url = element.url || '#'
    this.hyperlinkDom.href = url
    this.hyperlinkDom.title = url
    this.hyperlinkDom.innerText = url
    // Video preview
    const embedUrl = this._getVideoEmbedUrl(url)
    if (embedUrl) {
      if (this.hyperlinkPreviewDom.src !== embedUrl) {
        this.hyperlinkPreviewDom.src = embedUrl
      }
      this.hyperlinkPreviewDom.style.display = 'block'
    } else {
      this.hyperlinkPreviewDom.style.display = 'none'
      this.hyperlinkPreviewDom.removeAttribute('src')
    }
  }

  public clearHyperlinkPopup() {
    this.hyperlinkPopupContainer.style.display = 'none'
    // Stop any playing video preview by clearing the iframe src.
    if (this.hyperlinkPreviewDom.style.display !== 'none') {
      this.hyperlinkPreviewDom.removeAttribute('src')
      this.hyperlinkPreviewDom.style.display = 'none'
    }
  }

  public openHyperlink(element: IElement) {
    const newTab = window.open(element.url, '_blank')
    if (newTab) {
      newTab.opener = null
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    element: IRowElement,
    x: number,
    y: number
  ) {
    ctx.save()
    ctx.font = element.style
    if (!element.color) {
      element.color = this.options.defaultHyperlinkColor
    }
    ctx.fillStyle = element.color
    if (element.underline === undefined) {
      element.underline = true
    }
    ctx.fillText(element.value, x, y)
    ctx.restore()
  }
}
