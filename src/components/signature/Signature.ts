import { EditorComponent, EDITOR_COMPONENT } from '../../editor'
import './signature.css'

export interface ISignatureResult {
  value: string
  width: number
  height: number
}

export interface ISignatureOptions {
  width?: number
  height?: number
  onClose?: () => void
  onCancel?: () => void
  onConfirm?: (payload: ISignatureResult | null) => void
}

export class Signature {
  private readonly MAX_RECORD_COUNT = 1000
  private readonly DEFAULT_WIDTH = 390
  private readonly DEFAULT_HEIGHT = 180
  private undoStack: Array<Function> = []
  private x = 0
  private y = 0
  private isDrawing = false
  private isDrawn = false
  private linePoints: [number, number][] = []
  private canvasWidth: number
  private canvasHeight: number
  private options: ISignatureOptions
  private mask: HTMLDivElement
  private container: HTMLDivElement
  private trashContainer: HTMLDivElement
  private undoContainer: HTMLDivElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private preTimeStamp: number
  private dpr: number

  constructor(options: ISignatureOptions) {
    this.options = options
    this.preTimeStamp = 0
    this.dpr = window.devicePixelRatio
    this.canvasWidth = (options.width || this.DEFAULT_WIDTH) * this.dpr
    this.canvasHeight = (options.height || this.DEFAULT_HEIGHT) * this.dpr
    const { mask, container, trashContainer, undoContainer, canvas } =
      this._render()
    this.mask = mask
    this.container = container
    this.trashContainer = trashContainer
    this.undoContainer = undoContainer
    this.canvas = canvas
    this.ctx = <CanvasRenderingContext2D>canvas.getContext('2d')
    this.ctx.scale(this.dpr, this.dpr)
    this.ctx.lineCap = 'round'
    this._bindEvent()
    this._clearUndoFn()
  }

  private _render() {
    const { onClose, onCancel, onConfirm } = this.options
    // render mask layer
    const mask = document.createElement('div')
    mask.classList.add('signature-mask')
    mask.setAttribute(EDITOR_COMPONENT, EditorComponent.COMPONENT)
    document.body.append(mask)
    // render container
    const container = document.createElement('div')
    container.classList.add('signature-container')
    container.setAttribute(EDITOR_COMPONENT, EditorComponent.COMPONENT)
    // Pop-ups
    const signatureContainer = document.createElement('div')
    signatureContainer.classList.add('signature')
    container.append(signatureContainer)
    // title container
    const titleContainer = document.createElement('div')
    titleContainer.classList.add('signature-title')
    // Title & Close Button
    const titleSpan = document.createElement('span')
    titleSpan.append(document.createTextNode('Insert signature'))
    const titleClose = document.createElement('i')
    titleClose.onclick = () => {
      if (onClose) {
        onClose()
      }
      this._dispose()
    }
    titleContainer.append(titleSpan)
    titleContainer.append(titleClose)
    signatureContainer.append(titleContainer)
    // operating area
    const operationContainer = document.createElement('div')
    operationContainer.classList.add('signature-operation')
    // undo
    const undoContainer = document.createElement('div')
    undoContainer.classList.add('signature-operation__undo')
    const undoIcon = document.createElement('i')
    const undoLabel = document.createElement('span')
    undoLabel.innerText = 'undo'
    undoContainer.append(undoIcon)
    undoContainer.append(undoLabel)
    operationContainer.append(undoContainer)
    // clear canvas
    const trashContainer = document.createElement('div')
    trashContainer.classList.add('signature-operation__trash')
    const trashIcon = document.createElement('i')
    const trashLabel = document.createElement('span')
    trashLabel.innerText = 'delete'
    trashContainer.append(trashIcon)
    trashContainer.append(trashLabel)
    operationContainer.append(trashContainer)
    signatureContainer.append(operationContainer)
    // drawing area
    const canvasContainer = document.createElement('div')
    canvasContainer.classList.add('signature-canvas')
    const canvas = document.createElement('canvas')
    canvas.width = this.canvasWidth
    canvas.height = this.canvasHeight
    canvas.style.width = `${this.canvasWidth / this.dpr}px`
    canvas.style.height = `${this.canvasHeight / this.dpr}px`
    canvasContainer.append(canvas)
    signatureContainer.append(canvasContainer)
    // button container
    const menuContainer = document.createElement('div')
    menuContainer.classList.add('signature-menu')
    // cancel button
    const cancelBtn = document.createElement('button')
    cancelBtn.classList.add('signature-menu__cancel')
    cancelBtn.append(document.createTextNode('Cancel'))
    cancelBtn.type = 'button'
    cancelBtn.onclick = () => {
      if (onCancel) {
        onCancel()
      }
      this._dispose()
    }
    menuContainer.append(cancelBtn)
    // 确认按钮
    const confirmBtn = document.createElement('button')
    confirmBtn.append(document.createTextNode('Submit'))
    confirmBtn.type = 'submit'
    confirmBtn.onclick = () => {
      if (onConfirm) {
        onConfirm(this._toData())
      }
      this._dispose()
    }
    menuContainer.append(confirmBtn)
    signatureContainer.append(menuContainer)
    // 渲染
    document.body.append(container)
    this.container = container
    this.mask = mask
    return {
      mask,
      canvas,
      container,
      trashContainer,
      undoContainer
    }
  }

  private _bindEvent() {
    this.trashContainer.onclick = this._clearCanvas.bind(this)
    this.undoContainer.onclick = this._undo.bind(this)
    this.canvas.onmousedown = this._startDraw.bind(this)
    this.canvas.onmousemove = this._draw.bind(this)
    this.container.onmouseup = this._stopDraw.bind(this)
  }

  private _undo() {
    if (this.undoStack.length > 1) {
      this.undoStack.pop()
      if (this.undoStack.length) {
        this.undoStack[this.undoStack.length - 1]()
      }
    }
  }

  private _saveUndoFn(fn: Function) {
    this.undoStack.push(fn)
    while (this.undoStack.length > this.MAX_RECORD_COUNT) {
      this.undoStack.shift()
    }
  }

  private _clearUndoFn() {
    const clearFn = () => {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    }
    this.undoStack = [clearFn]
  }

  private _clearCanvas() {
    this._clearUndoFn()
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
  }

  private _startDraw(evt: MouseEvent) {
    this.isDrawing = true
    this.x = evt.offsetX
    this.y = evt.offsetY
    this.ctx.lineWidth = 1
  }

  private _draw(evt: MouseEvent) {
    if (!this.isDrawing) return
    // 计算鼠标移动速度
    const curTimestamp = performance.now()
    const distance = Math.sqrt(evt.movementX ** 2 + evt.movementY ** 2)
    const speed = distance / (curTimestamp - this.preTimeStamp)
    // 目标线宽：最小速度1，最大速度5，系数3
    const SPEED_FACTOR = 3
    const targetLineWidth = Math.min(5, Math.max(1, 5 - speed * SPEED_FACTOR))
    // 平滑过渡算法（20%的变化比例）调整线条粗细：系数0.2
    const SMOOTH_FACTOR = 0.2
    this.ctx.lineWidth =
      this.ctx.lineWidth * (1 - SMOOTH_FACTOR) + targetLineWidth * SMOOTH_FACTOR
    // 绘制
    const { offsetX, offsetY } = evt
    this.ctx.beginPath()
    this.ctx.moveTo(this.x, this.y)
    this.ctx.lineTo(offsetX, offsetY)
    this.ctx.stroke()
    this.x = offsetX
    this.y = offsetY
    this.linePoints.push([offsetX, offsetY])
    this.isDrawn = true
    // 缓存之前时间戳
    this.preTimeStamp = curTimestamp
  }

  private _stopDraw() {
    this.isDrawing = false
    if (this.isDrawn) {
      const imageData = this.ctx.getImageData(
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      )
      const self = this
      this._saveUndoFn(function () {
        self.ctx.clearRect(0, 0, self.canvasWidth, self.canvasHeight)
        self.ctx.putImageData(imageData, 0, 0)
      })
      this.isDrawn = false
    }
  }

  private _toData(): ISignatureResult | null {
    if (!this.linePoints.length) return null
    // 查找矩形四角坐标
    const startX = this.linePoints[0][0]
    const startY = this.linePoints[0][1]
    let minX = startX
    let minY = startY
    let maxX = startX
    let maxY = startY
    for (let p = 0; p < this.linePoints.length; p++) {
      const point = this.linePoints[p]
      if (minX > point[0]) {
        minX = point[0]
      }
      if (maxX < point[0]) {
        maxX = point[0]
      }
      if (minY > point[1]) {
        minY = point[1]
      }
      if (maxY < point[1]) {
        maxY = point[1]
      }
    }
    // 增加边框宽度
    const lineWidth = this.ctx.lineWidth
    minX = minX < lineWidth ? 0 : minX - lineWidth
    minY = minY < lineWidth ? 0 : minY - lineWidth
    maxX = maxX + lineWidth
    maxY = maxY + lineWidth
    const sw = maxX - minX
    const sh = maxY - minY
    // 裁剪图像
    const imageData = this.ctx.getImageData(
      minX * this.dpr,
      minY * this.dpr,
      sw * this.dpr,
      sh * this.dpr
    )
    const canvas = document.createElement('canvas')
    canvas.style.width = `${sw}px`
    canvas.style.height = `${sh}px`
    canvas.width = sw * this.dpr
    canvas.height = sh * this.dpr
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d')!
    ctx.putImageData(imageData, 0, 0)
    const value = canvas.toDataURL()
    return {
      value,
      width: sw,
      height: sh
    }
  }

  private _dispose() {
    this.mask.remove()
    this.container.remove()
  }
}
