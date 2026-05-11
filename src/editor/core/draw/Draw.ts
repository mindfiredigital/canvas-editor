import { version } from '../../../../package.json'
import { ZERO } from '../../dataset/constant/Common'
import { RowFlex } from '../../dataset/enum/Row'
import {
  IAppendElementListOption,
  IDrawOption,
  IDrawPagePayload,
  IDrawRowPayload,
  IGetValueOption,
  IPainterOption
} from '../../interface/Draw'
import {
  IEditorData,
  IEditorOption,
  IEditorResult
} from '../../interface/Editor'
import {
  IElement,
  IElementMetrics,
  IElementFillRect,
  IElementStyle,
  IElementPosition
} from '../../interface/Element'
import { IRow, IRowElement } from '../../interface/Row'
import { deepClone, getUUID, nextTick } from '../../utils'
import { Cursor } from '../cursor/Cursor'
import { CanvasEvent } from '../event/CanvasEvent'
import { GlobalEvent } from '../event/GlobalEvent'
import { HistoryManager } from '../history/HistoryManager'
import { Listener } from '../listener/Listener'
import { Position } from '../position/Position'
import { RangeManager } from '../range/RangeManager'
import { Background } from './frame/Background'
import { Highlight } from './richtext/Highlight'
import { Margin } from './frame/Margin'
import { Search } from './interactive/Search'
import { Strikeout } from './richtext/Strikeout'
import { Underline } from './richtext/Underline'
import { ElementType } from '../../dataset/enum/Element'
import { ImageParticle } from './particle/ImageParticle'
import { LaTexParticle } from './particle/latex/LaTexParticle'
import { TextParticle } from './particle/TextParticle'
import { PageNumber } from './frame/PageNumber'
import { ScrollObserver } from '../observer/ScrollObserver'
import { SelectionObserver } from '../observer/SelectionObserver'
import { TableParticle } from './particle/table/TableParticle'
import { TableTool } from './particle/table/TableTool'
import { HyperlinkParticle } from './particle/HyperlinkParticle'
import { Header } from './frame/Header'
import { SuperscriptParticle } from './particle/Superscript'
import { SubscriptParticle } from './particle/Subscript'
import { SeparatorParticle } from './particle/Separator'
import { PageBreakParticle } from './particle/PageBreak'
import { Watermark } from './frame/Watermark'
import {
  EditorComponent,
  EditorMode,
  EditorZone,
  PageMode,
  PaperDirection,
  WordBreak
} from '../../dataset/enum/Editor'
import { Control } from './control/Control'
import { zipElementList } from '../../utils/element'
import { CheckboxParticle } from './particle/CheckboxParticle'
import { DeepRequired } from '../../interface/Common'
import { ControlComponent, ImageDisplay } from '../../dataset/enum/Control'
import { formatElementList } from '../../utils/element'
import { WorkerManager } from '../worker/WorkerManager'
import { Previewer } from './particle/previewer/Previewer'
import { DateParticle } from './particle/date/DateParticle'
import { IMargin } from '../../interface/Margin'
import { BlockParticle } from './particle/block/BlockParticle'
import { EDITOR_COMPONENT, EDITOR_PREFIX } from '../../dataset/constant/Editor'
import { I18n } from '../i18n/I18n'
import { ImageObserver } from '../observer/ImageObserver'
import { Zone } from '../zone/Zone'
import { Footer } from './frame/Footer'
import { INLINE_ELEMENT_TYPE } from '../../dataset/constant/Element'
import { ListParticle } from './particle/ListParticle'
import { Placeholder } from './frame/Placeholder'
import { WORD_LIKE_REG } from '../../dataset/constant/Regular'
import { EventBus } from '../event/eventbus/EventBus'
import { EventBusMap } from '../../interface/EventBus'
import { ITr } from '../../interface/table/Tr'
import { ITd } from '../../interface/table/Td'

export class Draw {
  private container: HTMLDivElement
  private pageContainer: HTMLDivElement
  private pageList: HTMLCanvasElement[]
  private ctxList: CanvasRenderingContext2D[]
  private pageNo: number
  private pagePixelRatio: number | null
  private mode: EditorMode
  private options: DeepRequired<IEditorOption>
  private position: Position
  private zone: Zone
  private elementList: IElement[]
  private listener: Listener
  private eventBus: EventBus<EventBusMap>

  private i18n: I18n
  private canvasEvent: CanvasEvent
  private globalEvent: GlobalEvent
  private cursor: Cursor
  private range: RangeManager
  private margin: Margin
  private background: Background
  private search: Search
  private underline: Underline
  private strikeout: Strikeout
  private highlight: Highlight
  private historyManager: HistoryManager
  private previewer: Previewer
  private imageParticle: ImageParticle
  private laTexParticle: LaTexParticle
  private textParticle: TextParticle
  private tableParticle: TableParticle
  private tableTool: TableTool
  private pageNumber: PageNumber
  private waterMark: Watermark
  private placeholder: Placeholder
  private header: Header
  private footer: Footer
  private hyperlinkParticle: HyperlinkParticle
  private dateParticle: DateParticle
  private separatorParticle: SeparatorParticle
  private pageBreakParticle: PageBreakParticle
  private superscriptParticle: SuperscriptParticle
  private subscriptParticle: SubscriptParticle
  private checkboxParticle: CheckboxParticle
  private blockParticle: BlockParticle
  private listParticle: ListParticle
  private control: Control
  private workerManager: WorkerManager
  private scrollObserver: ScrollObserver
  private selectionObserver: SelectionObserver
  private imageObserver: ImageObserver

  private rowList: IRow[]
  private pageRowList: IRow[][]
  private painterStyle: IElementStyle | null
  private painterOptions: IPainterOption | null
  private visiblePageNoList: number[]
  private intersectionPageNo: number
  private lazyRenderIntersectionObserver: IntersectionObserver | null

  private isDestroyed = false

  constructor(
    rootContainer: HTMLElement,
    options: DeepRequired<IEditorOption>,
    data: IEditorData,
    listener: Listener,
    eventBus: EventBus<EventBusMap>
  ) {
    this.container = this._wrapContainer(rootContainer)
    this.pageList = []
    this.ctxList = []
    this.pageNo = 0
    this.pagePixelRatio = null
    this.mode = options.mode
    this.options = options
    this.elementList = data.main
    this.listener = listener
    this.eventBus = eventBus

    this._formatContainer()
    this.pageContainer = this._createPageContainer()
    this._createPage(0)

    this.i18n = new I18n()
    this.historyManager = new HistoryManager(this)
    this.position = new Position(this)
    this.zone = new Zone(this)
    this.range = new RangeManager(this)
    this.margin = new Margin(this)
    this.background = new Background(this)
    this.search = new Search(this)
    this.underline = new Underline(this)
    this.strikeout = new Strikeout(this)
    this.highlight = new Highlight(this)
    this.previewer = new Previewer(this)
    this.imageParticle = new ImageParticle(this)
    this.laTexParticle = new LaTexParticle(this)
    this.textParticle = new TextParticle(this)
    this.tableParticle = new TableParticle(this)
    this.tableTool = new TableTool(this)
    this.pageNumber = new PageNumber(this)
    this.waterMark = new Watermark(this)
    this.placeholder = new Placeholder(this)
    this.header = new Header(this, data.header)
    this.footer = new Footer(this, data.footer)
    this.hyperlinkParticle = new HyperlinkParticle(this)
    this.dateParticle = new DateParticle(this)
    this.separatorParticle = new SeparatorParticle()
    this.pageBreakParticle = new PageBreakParticle(this)
    this.superscriptParticle = new SuperscriptParticle()
    this.subscriptParticle = new SubscriptParticle()
    this.checkboxParticle = new CheckboxParticle(this)
    this.blockParticle = new BlockParticle(this)
    this.listParticle = new ListParticle(this)
    this.control = new Control(this)

    this.scrollObserver = new ScrollObserver(this)
    this.selectionObserver = new SelectionObserver(this)
    this.imageObserver = new ImageObserver()

    this.canvasEvent = new CanvasEvent(this)
    this.cursor = new Cursor(this, this.canvasEvent)
    this.canvasEvent.register()
    this.globalEvent = new GlobalEvent(this, this.canvasEvent)
    this.globalEvent.register()

    this.workerManager = new WorkerManager(this)

    this.rowList = []
    this.pageRowList = []
    this.painterStyle = null
    this.painterOptions = null
    this.visiblePageNoList = []
    this.intersectionPageNo = 0
    this.lazyRenderIntersectionObserver = null

    this.render({
      isInit: true,
      isSetCursor: false
    })
  }

  public getMode(): EditorMode {
    return this.mode
  }

  public setMode(payload: EditorMode) {
    this.mode = payload
  }

  public isReadonly() {
    switch (this.mode) {
      case EditorMode.READONLY:
        return true
      case EditorMode.FORM:
        return !this.control.isRangeWithinControl()
      default:
        return false
    }
  }

  public getOriginalWidth(): number {
    const { paperDirection, width, height } = this.options
    return paperDirection === PaperDirection.VERTICAL ? width : height
  }

  public getOriginalHeight(): number {
    const { paperDirection, width, height } = this.options
    return paperDirection === PaperDirection.VERTICAL ? height : width
  }

  public getWidth(): number {
    return Math.floor(this.getOriginalWidth() * this.options.scale)
  }

  public getHeight(): number {
    return Math.floor(this.getOriginalHeight() * this.options.scale)
  }

  public getMainHeight(): number {
    const pageHeight = this.getHeight()
    return pageHeight - this.getMainOuterHeight()
  }

  public getMainOuterHeight(): number {
    const margins = this.getMargins()
    const headerExtraHeight = this.header.getExtraHeight()
    const footerExtraHeight = this.footer.getExtraHeight()
    return margins[0] + margins[2] + headerExtraHeight + footerExtraHeight
  }

  public getCanvasWidth(pageNo = -1): number {
    const page = this.getPage(pageNo)
    return page.width
  }

  public getCanvasHeight(pageNo = -1): number {
    const page = this.getPage(pageNo)
    return page.height
  }

  public getInnerWidth(): number {
    const width = this.getWidth()
    const margins = this.getMargins()
    return width - margins[1] - margins[3]
  }

  public getOriginalInnerWidth(): number {
    const width = this.getOriginalWidth()
    const margins = this.getOriginalMargins()
    return width - margins[1] - margins[3]
  }

  public getMargins(): IMargin {
    return <IMargin>this.getOriginalMargins().map(m => m * this.options.scale)
  }

  public getOriginalMargins(): number[] {
    const { margins, paperDirection } = this.options
    return paperDirection === PaperDirection.VERTICAL
      ? margins
      : [margins[1], margins[2], margins[3], margins[0]]
  }

  public getPageGap(): number {
    return this.options.pageGap * this.options.scale
  }

  public getPageNumberBottom(): number {
    const {
      pageNumber: { bottom },
      scale
    } = this.options
    return bottom * scale
  }

  public getMarginIndicatorSize(): number {
    return this.options.marginIndicatorSize * this.options.scale
  }

  public getDefaultBasicRowMarginHeight(): number {
    return this.options.defaultBasicRowMarginHeight * this.options.scale
  }

  public getTdPadding(): number {
    return this.options.tdPadding * this.options.scale
  }

  public getContainer(): HTMLDivElement {
    return this.container
  }

  public getPageContainer(): HTMLDivElement {
    return this.pageContainer
  }

  public getVisiblePageNoList(): number[] {
    return this.visiblePageNoList
  }

  public setVisiblePageNoList(payload: number[]) {
    this.visiblePageNoList = payload
    if (this.listener.visiblePageNoListChange) {
      this.listener.visiblePageNoListChange(this.visiblePageNoList)
    }
    if (this.eventBus.isSubscribe('visiblePageNoListChange')) {
      this.eventBus.emit('visiblePageNoListChange', this.visiblePageNoList)
    }
  }

  public getIntersectionPageNo(): number {
    return this.intersectionPageNo
  }

  public setIntersectionPageNo(payload: number) {
    if (this.isDestroyed) return
    this.intersectionPageNo = payload
    if (this.listener.intersectionPageNoChange) {
      this.listener.intersectionPageNoChange(this.intersectionPageNo)
    }
    if (this.eventBus.isSubscribe('intersectionPageNoChange')) {
      this.eventBus.emit('intersectionPageNoChange', this.intersectionPageNo)
    }
  }

  public getPageNo(): number {
    return this.pageNo
  }

  public setPageNo(payload: number) {
    this.pageNo = payload
  }

  public getPage(pageNo = -1): HTMLCanvasElement {
    return this.pageList[~pageNo ? pageNo : this.pageNo]
  }

  public getPageList(): HTMLCanvasElement[] {
    return this.pageList
  }

  public getPageCount(): number {
    return this.pageList.length
  }

  public getTableRowList(sourceElementList: IElement[]): IRow[] {
    const positionContext = this.position.getPositionContext()
    const { index, trIndex, tdIndex } = positionContext
    return sourceElementList[index!].trList![trIndex!].tdList[tdIndex!].rowList!
  }

  public getOriginalRowList() {
    const zoneManager = this.getZone()
    if (zoneManager.isHeaderActive()) {
      return this.header.getRowList()
    }
    if (zoneManager.isFooterActive()) {
      return this.footer.getRowList()
    }
    return this.rowList
  }

  public getRowList(): IRow[] {
    const positionContext = this.position.getPositionContext()
    return positionContext.isTable
      ? this.getTableRowList(this.getOriginalElementList())
      : this.getOriginalRowList()
  }

  public getPageRowList(): IRow[][] {
    return this.pageRowList
  }

  public getCtx(): CanvasRenderingContext2D {
    return this.ctxList[this.pageNo]
  }

  public getOptions(): DeepRequired<IEditorOption> {
    return this.options
  }

  public getSearch(): Search {
    return this.search
  }

  public getHistoryManager(): HistoryManager {
    return this.historyManager
  }

  public getPosition(): Position {
    return this.position
  }

  public getZone(): Zone {
    return this.zone
  }

  public getRange(): RangeManager {
    return this.range
  }

  public getHeaderElementList(): IElement[] {
    return this.header.getElementList()
  }

  public getTableElementList(sourceElementList: IElement[]): IElement[] {
    const positionContext = this.position.getPositionContext()
    const { index, trIndex, tdIndex } = positionContext
    return sourceElementList[index!].trList![trIndex!].tdList[tdIndex!].value
  }

  public getElementList(): IElement[] {
    const positionContext = this.position.getPositionContext()
    const elementList = this.getOriginalElementList()
    return positionContext.isTable
      ? this.getTableElementList(elementList)
      : elementList
  }

  public getMainElementList(): IElement[] {
    const positionContext = this.position.getPositionContext()
    return positionContext.isTable
      ? this.getTableElementList(this.elementList)
      : this.elementList
  }

  public getOriginalElementList() {
    const zoneManager = this.getZone()
    if (zoneManager.isHeaderActive()) {
      return this.getHeaderElementList()
    }
    if (zoneManager.isFooterActive()) {
      return this.getFooterElementList()
    }
    return this.elementList
  }

  public getOriginalMainElementList(): IElement[] {
    return this.elementList
  }

  public getFooterElementList(): IElement[] {
    return this.footer.getElementList()
  }

  public insertElementList(payload: IElement[]) {
    if (!payload.length) return
    const isPartRangeInControlOutside =
      this.control.isPartRangeInControlOutside()
    if (isPartRangeInControlOutside) return
    const { startIndex, endIndex } = this.range.getRange()
    if (!~startIndex && !~endIndex) return
    formatElementList(payload, {
      isHandleFirstElement: false,
      editorOptions: this.options
    })
    let curIndex = -1
    // 判断是否在控件内
    const activeControl = this.control.getActiveControl()
    if (activeControl && !this.control.isRangInPostfix()) {
      curIndex = activeControl.setValue(payload)
    } else {
      const elementList = this.getElementList()
      const isCollapsed = startIndex === endIndex
      const start = startIndex + 1
      if (!isCollapsed) {
        this.spliceElementList(elementList, start, endIndex - startIndex)
      }
      this.spliceElementList(elementList, start, 0, ...payload)
      curIndex = startIndex + payload.length
    }
    if (~curIndex) {
      this.range.setRange(curIndex, curIndex)
      this.render({
        curIndex
      })
    }
  }

  public appendElementList(
    elementList: IElement[],
    options: IAppendElementListOption = {}
  ) {
    if (!elementList.length) return
    formatElementList(elementList, {
      isHandleFirstElement: false,
      editorOptions: this.options
    })
    let curIndex: number
    const { isPrepend } = options
    if (isPrepend) {
      this.elementList.splice(1, 0, ...elementList)
      curIndex = elementList.length
    } else {
      this.elementList.push(...elementList)
      curIndex = this.elementList.length - 1
    }
    this.range.setRange(curIndex, curIndex)
    this.render({
      curIndex
    })
  }

  public spliceElementList(
    elementList: IElement[],
    start: number,
    deleteCount: number,
    ...items: IElement[]
  ) {
    if (deleteCount > 0) {
      // When the last element does not match the list information of the beginning element: Clear the current list information.
      const endIndex = start + deleteCount
      const endElement = elementList[endIndex]
      const endElementListId = endElement?.listId
      if (
        endElementListId &&
        elementList[start - 1]?.listId !== endElementListId
      ) {
        let startIndex = endIndex
        while (startIndex < elementList.length) {
          const curElement = elementList[startIndex]
          if (
            curElement.listId !== endElementListId ||
            curElement.value === ZERO
          ) {
            break
          }
          delete curElement.listId
          delete curElement.listType
          delete curElement.listStyle
          startIndex++
        }
      }
    }
    elementList.splice(start, deleteCount, ...items)
  }

  public getCanvasEvent(): CanvasEvent {
    return this.canvasEvent
  }

  public getListener(): Listener {
    return this.listener
  }

  public getEventBus(): EventBus<EventBusMap> {
    return this.eventBus
  }

  public getCursor(): Cursor {
    return this.cursor
  }

  public getPreviewer(): Previewer {
    return this.previewer
  }

  public getImageParticle(): ImageParticle {
    return this.imageParticle
  }

  public getTableTool(): TableTool {
    return this.tableTool
  }

  public getTableParticle(): TableParticle {
    return this.tableParticle
  }

  public getHeader(): Header {
    return this.header
  }

  public getFooter(): Footer {
    return this.footer
  }

  public getHyperlinkParticle(): HyperlinkParticle {
    return this.hyperlinkParticle
  }

  public getDateParticle(): DateParticle {
    return this.dateParticle
  }

  public getListParticle(): ListParticle {
    return this.listParticle
  }

  public getControl(): Control {
    return this.control
  }

  public getWorkerManager(): WorkerManager {
    return this.workerManager
  }

  public getImageObserver(): ImageObserver {
    return this.imageObserver
  }

  public getI18n(): I18n {
    return this.i18n
  }

  public getRowCount(): number {
    return this.rowList.length
  }

  public async getDataURL(pixelRatio?: number): Promise<string[]> {
    if (pixelRatio) {
      this.setPagePixelRatio(pixelRatio)
    }
    this.render({
      isLazy: false,
      isCompute: false,
      isSetCursor: false,
      isSubmitHistory: false
    })
    await this.imageObserver.allSettled()
    const dataUrlList = this.pageList.map(c => c.toDataURL())
    if (pixelRatio) {
      this.setPagePixelRatio(null)
    }
    return dataUrlList
  }

  public getPainterStyle(): IElementStyle | null {
    return this.painterStyle && Object.keys(this.painterStyle).length
      ? this.painterStyle
      : null
  }

  public getPainterOptions(): IPainterOption | null {
    return this.painterOptions
  }

  public setPainterStyle(
    payload: IElementStyle | null,
    options?: IPainterOption
  ) {
    this.painterStyle = payload
    this.painterOptions = options || null
    if (this.getPainterStyle()) {
      this.pageList.forEach(c => (c.style.cursor = 'copy'))
    }
  }

  public setDefaultRange() {
    if (!this.elementList.length) return
    setTimeout(() => {
      const curIndex = this.elementList.length - 1
      this.range.setRange(curIndex, curIndex)
      this.range.setRangeStyle()
    })
  }

  public getIsPagingMode(): boolean {
    return this.options.pageMode === PageMode.PAGING
  }

  public setPageMode(payload: PageMode) {
    if (!payload || this.options.pageMode === payload) return
    this.options.pageMode = payload
    // 纸张大小重置
    if (payload === PageMode.PAGING) {
      const { height } = this.options
      const dpr = this.getPagePixelRatio()
      const canvas = this.pageList[0]
      canvas.style.height = `${height}px`
      canvas.height = height * dpr
      // canvas尺寸发生变化，上下文被重置
      this._initPageContext(this.ctxList[0])
    } else {
      // 连页模式：移除懒加载监听&清空页眉页脚计算数据
      this._disconnectLazyRender()
      this.header.recovery()
      this.footer.recovery()
      this.zone.setZone(EditorZone.MAIN)
    }
    this.render({
      isSubmitHistory: false,
      isSetCursor: false
    })
    // 回调
    setTimeout(() => {
      if (this.listener.pageModeChange) {
        this.listener.pageModeChange(payload)
      }
      if (this.eventBus.isSubscribe('pageModeChange')) {
        this.eventBus.emit('pageModeChange', payload)
      }
    })
  }

  public setPageScale(payload: number) {
    const dpr = this.getPagePixelRatio()
    this.options.scale = payload
    const width = this.getWidth()
    const height = this.getHeight()
    this.container.style.width = `${width}px`
    this.pageList.forEach((p, i) => {
      p.width = width * dpr
      p.height = height * dpr
      p.style.width = `${width}px`
      p.style.height = `${height}px`
      p.style.marginBottom = `${this.getPageGap()}px`
      this._initPageContext(this.ctxList[i])
    })
    this.render({
      isSubmitHistory: false,
      isSetCursor: false
    })
    if (this.listener.pageScaleChange) {
      this.listener.pageScaleChange(payload)
    }
  }

  public getPagePixelRatio(): number {
    return this.pagePixelRatio || window.devicePixelRatio
  }

  public setPagePixelRatio(payload: number | null) {
    if (
      (!this.pagePixelRatio && payload === window.devicePixelRatio) ||
      payload === this.pagePixelRatio
    ) {
      return
    }
    this.pagePixelRatio = payload
    this.setPageDevicePixel()
  }

  public setPageDevicePixel() {
    const dpr = this.getPagePixelRatio()
    const width = this.getWidth()
    const height = this.getHeight()
    this.pageList.forEach((p, i) => {
      p.width = width * dpr
      p.height = height * dpr
      this._initPageContext(this.ctxList[i])
    })
    this.render({
      isSubmitHistory: false,
      isSetCursor: false
    })
  }

  public setPaperSize(width: number, height: number) {
    this.options.width = width
    this.options.height = height
    const dpr = this.getPagePixelRatio()
    const realWidth = this.getWidth()
    const realHeight = this.getHeight()
    this.container.style.width = `${realWidth}px`
    this.pageList.forEach((p, i) => {
      p.width = realWidth * dpr
      p.height = realHeight * dpr
      p.style.width = `${realWidth}px`
      p.style.height = `${realHeight}px`
      this._initPageContext(this.ctxList[i])
    })
    this.render({
      isSubmitHistory: false,
      isSetCursor: false
    })
  }

  public setPaperDirection(payload: PaperDirection) {
    const dpr = this.getPagePixelRatio()
    this.options.paperDirection = payload
    const width = this.getWidth()
    const height = this.getHeight()
    this.container.style.width = `${width}px`
    this.pageList.forEach((p, i) => {
      p.width = width * dpr
      p.height = height * dpr
      p.style.width = `${width}px`
      p.style.height = `${height}px`
      this._initPageContext(this.ctxList[i])
    })
    this.render({
      isSubmitHistory: false,
      isSetCursor: false
    })
  }

  public setPaperMargin(payload: IMargin) {
    this.options.margins = payload
    this.render({
      isSubmitHistory: false,
      isSetCursor: false
    })
  }

  public getValue(options: IGetValueOption = {}): IEditorResult {
    // 配置
    const { width, height, margins, watermark } = this.options
    // 数据
    const { pageNo } = options
    let mainElementList = this.elementList
    if (
      Number.isInteger(pageNo) &&
      pageNo! >= 0 &&
      pageNo! < this.pageRowList.length
    ) {
      mainElementList = this.pageRowList[pageNo!].flatMap(
        row => row.elementList
      )
    }
    const data: IEditorData = {
      header: zipElementList(this.getHeaderElementList()),
      main: zipElementList(mainElementList),
      footer: zipElementList(this.getFooterElementList())
    }
    return {
      version,
      width,
      height,
      margins,
      watermark: watermark.data ? watermark : undefined,
      data
    }
  }

  public setValue(payload: Partial<IEditorData>) {
    const { header, main, footer } = payload
    if (!header && !main && !footer) return
    if (header) {
      formatElementList(header, {
        editorOptions: this.options
      })
      this.header.setElementList(header)
    }
    if (main) {
      formatElementList(main, {
        editorOptions: this.options
      })
      this.elementList = main
    }
    if (footer) {
      formatElementList(footer, {
        editorOptions: this.options
      })
      this.footer.setElementList(footer)
    }
    // 渲染&计算&清空历史记录
    this.historyManager.recovery()
    this.render({
      isSetCursor: false
    })
  }

  private _wrapContainer(rootContainer: HTMLElement): HTMLDivElement {
    const container = document.createElement('div')
    rootContainer.append(container)
    return container
  }

  private _formatContainer() {
    // 容器宽度需跟随纸张宽度
    this.container.style.position = 'relative'
    this.container.style.width = `${this.getWidth()}px`
    this.container.setAttribute(EDITOR_COMPONENT, EditorComponent.MAIN)
  }

  private _createPageContainer(): HTMLDivElement {
    const pageContainer = document.createElement('div')
    pageContainer.classList.add(`${EDITOR_PREFIX}-page-container`)
    this.container.append(pageContainer)
    return pageContainer
  }

  private _createPage(pageNo: number) {
    const width = this.getWidth()
    const height = this.getHeight()
    const canvas = document.createElement('canvas')
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.style.display = 'block'
    canvas.style.backgroundColor = '#ffffff'
    canvas.style.marginBottom = `${this.getPageGap()}px`
    canvas.setAttribute('data-index', String(pageNo))
    this.pageContainer.append(canvas)
    // 调整分辨率
    const dpr = this.getPagePixelRatio()
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.cursor = 'text'
    const ctx = canvas.getContext('2d')!
    // 初始化上下文配置
    this._initPageContext(ctx)
    // 缓存上下文
    this.pageList.push(canvas)
    this.ctxList.push(ctx)
  }

  private _initPageContext(ctx: CanvasRenderingContext2D) {
    const dpr = this.getPagePixelRatio()
    ctx.scale(dpr, dpr)
    // 重置以下属性是因部分浏览器(chrome)会应用css样式
    ctx.letterSpacing = '0px'
    ctx.wordSpacing = '0px'
    ctx.direction = 'ltr'
  }

  private _getFont(el: IElement, scale = 1): string {
    const { defaultSize, defaultFont } = this.options
    const font = el.font || defaultFont
    const size = el.actualSize || el.size || defaultSize
    return `${el.italic ? 'italic ' : ''}${el.bold ? 'bold ' : ''}${
      size * scale
    }px ${font}`
  }

  public computeRowList(innerWidth: number, elementList: IElement[]) {
    const { defaultSize, defaultRowMargin, scale, tdPadding, defaultTabWidth } =
      this.options
    const defaultBasicRowMarginHeight = this.getDefaultBasicRowMarginHeight()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const listStyleMap = this.listParticle.computeListStyle(ctx, elementList)
    const rowList: IRow[] = []
    if (elementList.length) {
      rowList.push({
        width: 0,
        height: 0,
        ascent: 0,
        elementList: [],
        startIndex: 0,
        rowFlex: elementList?.[1]?.rowFlex
      })
    }
    let listId: string | undefined
    let listIndex = 0

    for (let i = 0; i < elementList.length; i++) {
      const currentRow: IRow = rowList[rowList.length - 1]
      const element = elementList[i]
      const rowMargin =
        defaultBasicRowMarginHeight * (element.rowMargin || defaultRowMargin)
      const metrics: IElementMetrics = {
        width: 0,
        height: 0,
        boundingBoxAscent: 0,
        boundingBoxDescent: 0
      }
      const listOffsetX = element.listId
        ? listStyleMap.get(element.listId) || 0
        : 0
      const availableRowWidth = innerWidth - listOffsetX

      if (
        element.type === ElementType.IMAGE ||
        element.type === ElementType.LATEX
      ) {
        const elementWidth = element.width! * scale
        const elementHeight = element.height! * scale
        const baseWidth =
          element.imgDisplay === ImageDisplay.INLINE ? 0 : currentRow.width
        const exceedsRowWidth = baseWidth + elementWidth > availableRowWidth

        if (exceedsRowWidth) {
          const surplusWidth = availableRowWidth - baseWidth
          const adaptiveWidth =
            surplusWidth > 0
              ? surplusWidth
              : Math.min(elementWidth, availableRowWidth)
          element.width = adaptiveWidth
          element.height = (elementHeight * adaptiveWidth) / elementWidth
          metrics.width = element.width
          metrics.height = element.height
          metrics.boundingBoxDescent = element.height
        } else {
          metrics.width = elementWidth
          metrics.height = elementHeight
          metrics.boundingBoxDescent = elementHeight
        }
        metrics.boundingBoxAscent = 0
      } else if (element.type === ElementType.TABLE) {
        const tdGap = tdPadding * 2
        this.tableParticle.computeRowColInfo(element)
        const trList = element.trList!

        for (let trIndex = 0; trIndex < trList.length; trIndex++) {
          const tr = trList[trIndex]
          for (let tdIndex = 0; tdIndex < tr.tdList.length; tdIndex++) {
            const td = tr.tdList[tdIndex]
            const tdRowList = this.computeRowList(
              (td.width! - tdGap) * scale,
              td.value
            )
            const rowHeight = tdRowList.reduce(
              (pre, cur) => pre + cur.height,
              0
            )
            td.rowList = tdRowList
            const curTdHeight = (rowHeight + tdGap) / scale

            if (td.height! < curTdHeight) {
              const extraHeight = curTdHeight - td.height!
              const targetTr = trList[trIndex + td.rowspan - 1]
              targetTr.height += extraHeight
              targetTr.tdList.forEach(targetTd => {
                targetTd.height! += extraHeight
              })
            }

            let curTdMinHeight = 0
            let curTdRealHeight = 0
            let spanIndex = 0
            while (spanIndex < td.rowspan) {
              const curTr = trList[spanIndex + trIndex]
              curTdMinHeight += curTr.minHeight!
              curTdRealHeight += curTr.height!
              spanIndex++
            }
            td.realMinHeight = curTdMinHeight
            td.realHeight = curTdRealHeight
            td.mainHeight = curTdHeight
          }
        }

        const trListGroupedByCol =
          this.tableParticle.getTrListGroupByCol(trList)
        for (let trIndex = 0; trIndex < trListGroupedByCol.length; trIndex++) {
          const tr = trListGroupedByCol[trIndex]
          let reduceHeight = -1

          for (let tdIndex = 0; tdIndex < tr.tdList.length; tdIndex++) {
            const td = tr.tdList[tdIndex]
            const curTdRealHeight = td.realHeight!
            const curTdHeight = td.mainHeight!
            const curTdMinHeight = td.realMinHeight!
            const candidateReduceHeight =
              curTdHeight < curTdMinHeight
                ? curTdRealHeight - curTdMinHeight
                : curTdRealHeight - curTdHeight
            if (!~reduceHeight || candidateReduceHeight < reduceHeight) {
              reduceHeight = candidateReduceHeight
            }
          }

          if (reduceHeight <= 0) continue
          const targetTr = trList[trIndex]
          targetTr.height -= reduceHeight
          targetTr.tdList.forEach(targetTd => {
            targetTd.height! -= reduceHeight
          })
        }

        this.tableParticle.computeRowColInfo(element)
        const tableHeight = trList.reduce((pre, cur) => pre + cur.height, 0)
        const tableWidth = element.colgroup!.reduce(
          (pre, cur) => pre + cur.width,
          0
        )
        element.width = tableWidth
        element.height = tableHeight
        metrics.width = tableWidth * scale
        metrics.height = tableHeight * scale
        metrics.boundingBoxDescent = metrics.height
        metrics.boundingBoxAscent = 0

        const pageHeight = this.getHeight()
        const marginHeight = this.getMainOuterHeight()
        let accumulatedPageHeight = marginHeight
        for (let rowIndex = 0; rowIndex < rowList.length; rowIndex++) {
          const row = rowList[rowIndex]
          const isPageBreakBefore = rowList[rowIndex - 1]?.isPageBreak
          if (
            row.height + accumulatedPageHeight > pageHeight ||
            isPageBreakBefore
          ) {
            accumulatedPageHeight = marginHeight + row.height
          } else {
            accumulatedPageHeight += row.height
          }
        }

        const tableRowMarginHeight = rowMargin * 2 * scale
        const tableExceedsPage =
          accumulatedPageHeight + tableRowMarginHeight + metrics.height >
          pageHeight

        // --- table split ---
        if (tableExceedsPage) {
          let deleteStart = 0
          let deleteCount = 0
          let accumulatedTrHeight = 0

          if (trList.length > 1) {
            for (let rowIndex = 0; rowIndex < trList.length; rowIndex++) {
              const tr = trList[rowIndex]
              const trHeight = tr.height * scale
              const trExceedsPage =
                accumulatedPageHeight +
                  tableRowMarginHeight +
                  accumulatedTrHeight +
                  trHeight >
                pageHeight

              if (trExceedsPage) {
                const isSpannedRow =
                  element.colgroup?.length !== tr.tdList.length
                if (isSpannedRow) deleteCount = 0
                else {
                  // ← include the overflowing row itself in the split
                  deleteStart = rowIndex
                  deleteCount = trList.length - deleteStart
                }
                break
              }
              deleteStart = rowIndex + 1
              deleteCount = trList.length - deleteStart
              accumulatedTrHeight += trHeight
            }
          }

          if (deleteCount) {
            const cloneTrList = trList.splice(deleteStart, deleteCount)
            const tdList = cloneTrList[0].tdList
            const [currentPageTdList, nextPageTdList] =
              this.splitTrListByPageHeight(
                tdList,
                pageHeight - (accumulatedPageHeight + tableRowMarginHeight)
              )
            cloneTrList[0].tdList = nextPageTdList
            const tr = deepClone(trList[0])
            tr.height = currentPageTdList.reduce(
              (pre, cur) => pre + (cur.height || 0),
              0
            )
            tr.tdList = currentPageTdList

            const cloneTrHeight = cloneTrList[0].tdList.reduce(
              (pre, cur) => pre + (cur.height || 0),
              0
            )
            element.height -= cloneTrHeight
            metrics.height -= cloneTrHeight
            metrics.boundingBoxDescent -= cloneTrHeight
            const cloneElement = deepClone(element)
            cloneElement.trList = cloneTrList
            cloneElement.id = element.id
            this.spliceElementList(elementList, i + 1, 0, cloneElement)

            const positionContext = this.position.getPositionContext()
            const splitAtCursor =
              positionContext.isTable && positionContext.trIndex === deleteStart
            if (splitAtCursor) {
              positionContext.index! += 1
              positionContext.trIndex = 0
              this.position.setPositionContext(positionContext)
            }
          }
        }
      } else if (element.type === ElementType.SEPARATOR) {
        element.width = availableRowWidth
        metrics.width = availableRowWidth
        metrics.height = defaultSize
        metrics.boundingBoxAscent = -rowMargin
        metrics.boundingBoxDescent = -rowMargin
      } else if (element.type === ElementType.PAGE_BREAK) {
        element.width = availableRowWidth
        metrics.width = availableRowWidth
        metrics.height = defaultSize
      } else if (
        element.type === ElementType.CHECKBOX ||
        element.controlComponent === ControlComponent.CHECKBOX
      ) {
        const { width, height, gap } = this.options.checkbox
        const elementWidth = (width + gap * 2) * scale
        element.width = elementWidth
        metrics.width = elementWidth
        metrics.height = height * scale
      } else if (element.type === ElementType.TAB) {
        metrics.width = defaultTabWidth * scale
        metrics.height = defaultSize * scale
        metrics.boundingBoxDescent = 0
        metrics.boundingBoxAscent = metrics.height
      } else if (element.type === ElementType.BLOCK) {
        const elementWidth = element.width
          ? element.width * scale
          : availableRowWidth
        metrics.width = Math.min(elementWidth, availableRowWidth)
        metrics.height = element.height! * scale
        metrics.boundingBoxDescent = metrics.height
        metrics.boundingBoxAscent = 0
      } else {
        const size = element.size || defaultSize
        const isSuperOrSubscript =
          element.type === ElementType.SUPERSCRIPT ||
          element.type === ElementType.SUBSCRIPT
        if (isSuperOrSubscript) {
          element.actualSize = Math.ceil(size * 0.6)
        }
        metrics.height = (element.actualSize || size) * scale
        ctx.font = this._getFont(element)
        const fontMetrics = this.textParticle.measureText(ctx, element)
        metrics.width = fontMetrics.width * scale
        if (element.letterSpacing) {
          metrics.width += element.letterSpacing * scale
        }
        metrics.boundingBoxAscent =
          (element.value === ZERO
            ? defaultSize
            : fontMetrics.actualBoundingBoxAscent) * scale
        metrics.boundingBoxDescent =
          fontMetrics.actualBoundingBoxDescent * scale
        if (element.type === ElementType.SUPERSCRIPT) {
          metrics.boundingBoxAscent += metrics.height / 2
        } else if (element.type === ElementType.SUBSCRIPT) {
          metrics.boundingBoxDescent += metrics.height / 2
        }
      }

      const isImageOrLatexBlock =
        (element.imgDisplay !== ImageDisplay.INLINE &&
          element.type === ElementType.IMAGE) ||
        element.type === ElementType.LATEX
      const ascent = isImageOrLatexBlock
        ? metrics.height + rowMargin
        : metrics.boundingBoxAscent + rowMargin
      const height =
        rowMargin +
        metrics.boundingBoxAscent +
        metrics.boundingBoxDescent +
        rowMargin

      const rowElement: IRowElement = Object.assign(element, {
        metrics,
        style: this._getFont(element, scale)
      })

      const preElement = elementList[i - 1]
      let nextElement = elementList[i + 1]
      let curRowWidth = currentRow.width + metrics.width

      const isBreakWord = this.options.wordBreak === WordBreak.BREAK_WORD
      const isBothText =
        (!preElement?.type || preElement?.type === ElementType.TEXT) &&
        (!element.type || element.type === ElementType.TEXT)

      if (isBreakWord && isBothText) {
        const adjacentWord = `${preElement?.value || ''}${element.value}`
        if (WORD_LIKE_REG.test(adjacentWord)) {
          const { width, endElement } = this.textParticle.measureWord(
            ctx,
            elementList,
            i
          )
          curRowWidth += width
          nextElement = endElement
        }
        curRowWidth += this.textParticle.measurePunctuationWidth(
          ctx,
          nextElement
        )
      }

      if (element.listId) {
        if (element.listId !== listId) {
          listIndex = 0
        } else if (element.value === ZERO && !element.listWrap) {
          listIndex++
        }
      }
      listId = element.listId

      const mustBreakRow =
        element.type === ElementType.TABLE ||
        preElement?.type === ElementType.TABLE ||
        preElement?.type === ElementType.BLOCK ||
        element.type === ElementType.BLOCK ||
        preElement?.imgDisplay === ImageDisplay.INLINE ||
        element.imgDisplay === ImageDisplay.INLINE ||
        curRowWidth > availableRowWidth ||
        (i !== 0 && element.value === ZERO) ||
        preElement?.listId !== element.listId

      if (mustBreakRow) {
        const isLeadingEmptyRow =
          currentRow.startIndex === 0 &&
          currentRow.elementList.length === 1 &&
          (INLINE_ELEMENT_TYPE.includes(element.type!) || element.listId)
        if (isLeadingEmptyRow) {
          currentRow.height = defaultBasicRowMarginHeight
        }

        const shouldJustify =
          preElement?.rowFlex === RowFlex.ALIGNMENT &&
          curRowWidth > availableRowWidth
        if (shouldJustify) {
          const gap =
            (availableRowWidth - currentRow.width) /
            currentRow.elementList.length
          for (
            let elIndex = 0;
            elIndex < currentRow.elementList.length;
            elIndex++
          ) {
            currentRow.elementList[elIndex].metrics.width += gap
          }
          currentRow.width = availableRowWidth
        }

        const newRow: IRow = {
          width: metrics.width,
          height,
          startIndex: i,
          elementList: [rowElement],
          ascent,
          rowFlex: elementList[i + 1]?.rowFlex,
          isPageBreak: element.type === ElementType.PAGE_BREAK
        }
        if (element.listId) {
          newRow.isList = true
          newRow.offsetX = listStyleMap.get(element.listId!)
          newRow.listIndex = listIndex
        }
        rowList.push(newRow)
      } else {
        currentRow.width += metrics.width
        if (currentRow.height < height) {
          currentRow.height = height
          currentRow.ascent = ascent
        }
        currentRow.elementList.push(rowElement)
      }
    }

    return rowList
  }

  private _computePageList(): IRow[][] {
    const pageRowList: IRow[][] = [[]]
    const { pageMode } = this.options
    const height = this.getHeight()
    const marginHeight = this.getMainOuterHeight()
    let pageHeight = marginHeight
    let pageNo = 0
    if (pageMode === PageMode.CONTINUITY) {
      pageRowList[0] = this.rowList
      // 重置高度
      pageHeight += this.rowList.reduce((pre, cur) => pre + cur.height, 0)
      const dpr = this.getPagePixelRatio()
      const pageDom = this.pageList[0]
      const pageDomHeight = Number(pageDom.style.height.replace('px', ''))
      if (pageHeight > pageDomHeight) {
        pageDom.style.height = `${pageHeight}px`
        pageDom.height = pageHeight * dpr
      } else {
        const reduceHeight = pageHeight < height ? height : pageHeight
        pageDom.style.height = `${reduceHeight}px`
        pageDom.height = reduceHeight * dpr
      }
      this._initPageContext(this.ctxList[0])
    } else {
      for (let i = 0; i < this.rowList.length; i++) {
        const row = this.rowList[i]
        if (
          row.height + pageHeight > height ||
          this.rowList[i - 1]?.isPageBreak
        ) {
          pageHeight = marginHeight + row.height
          pageRowList.push([row])
          pageNo++
        } else {
          pageHeight += row.height
          pageRowList[pageNo].push(row)
        }
      }
    }
    return pageRowList
  }

  private _drawRichText(ctx: CanvasRenderingContext2D) {
    this.underline.render(ctx)
    this.strikeout.render(ctx)
    this.highlight.render(ctx)
    this.textParticle.complete()
  }

  public drawRow(ctx: CanvasRenderingContext2D, payload: IDrawRowPayload) {
    const { rowList, pageNo, elementList, positionList, startIndex, zone } =
      payload
    // const { scale, tdPadding } = this.options
    const { scale, tdPadding, defaultBasicRowMarginHeight, defaultRowMargin } =
      this.options
    const { isCrossRowCol, tableId } = this.range.getRange()
    let index = startIndex
    for (let i = 0; i < rowList.length; i++) {
      const curRow = rowList[i]
      // 选区绘制记录
      const rangeRecord: IElementFillRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
      let tableRangeElement: IElement | null = null
      for (let j = 0; j < curRow.elementList.length; j++) {
        const element = curRow.elementList[j]
        const metrics = element.metrics
        // 当前元素位置信息
        const {
          ascent: offsetY,
          coordinate: {
            leftTop: [x, y]
          }
        } = positionList[curRow.startIndex + j]
        const preElement = curRow.elementList[j - 1]
        // 元素高亮记录
        if (element.highlight) {
          // 高亮元素相连需立即绘制，并记录下一元素坐标
          if (
            preElement &&
            preElement.highlight &&
            preElement.highlight !== element.highlight
          ) {
            this.highlight.render(ctx)
          }
          this.highlight.recordFillInfo(
            ctx,
            x,
            y,
            metrics.width,
            curRow.height,
            element.highlight
          )
        } else if (preElement?.highlight) {
          this.highlight.render(ctx)
        }
        // 元素绘制
        if (element.type === ElementType.IMAGE) {
          this._drawRichText(ctx)
          this.imageParticle.render(ctx, element, x, y + offsetY)
        } else if (element.type === ElementType.LATEX) {
          this._drawRichText(ctx)
          this.laTexParticle.render(ctx, element, x, y + offsetY)
        } else if (element.type === ElementType.TABLE) {
          if (isCrossRowCol) {
            rangeRecord.x = x
            rangeRecord.y = y
            tableRangeElement = element
          }
          this.tableParticle.render(ctx, element, x, y)
        } else if (element.type === ElementType.HYPERLINK) {
          this._drawRichText(ctx)
          this.hyperlinkParticle.render(ctx, element, x, y + offsetY)
        } else if (element.type === ElementType.DATE) {
          this._drawRichText(ctx)
          this.dateParticle.render(ctx, element, x, y + offsetY)
        } else if (element.type === ElementType.SUPERSCRIPT) {
          this._drawRichText(ctx)
          this.superscriptParticle.render(ctx, element, x, y + offsetY)
        } else if (element.type === ElementType.SUBSCRIPT) {
          this._drawRichText(ctx)
          this.subscriptParticle.render(ctx, element, x, y + offsetY)
        } else if (element.type === ElementType.SEPARATOR) {
          this.separatorParticle.render(ctx, element, x, y)
        } else if (element.type === ElementType.PAGE_BREAK) {
          if (this.mode !== EditorMode.CLEAN) {
            this.pageBreakParticle.render(ctx, element, x, y)
          }
        } else if (
          element.type === ElementType.CHECKBOX ||
          element.controlComponent === ControlComponent.CHECKBOX
        ) {
          this._drawRichText(ctx)
          this.checkboxParticle.render(ctx, element, x, y + offsetY)
        } else if (element.type === ElementType.TAB) {
          this._drawRichText(ctx)
        } else if (element.rowFlex === RowFlex.ALIGNMENT) {
          // 如果是两端对齐，因canvas目前不支持letterSpacing需单独绘制文本
          this.textParticle.record(ctx, element, x, y + offsetY)
          this._drawRichText(ctx)
        } else if (element.type === ElementType.BLOCK) {
          this._drawRichText(ctx)
          this.blockParticle.render(pageNo, element, x, y)
        } else {
          this.textParticle.record(ctx, element, x, y + offsetY)
        }
        // 下划线记录
        if (element.underline) {
          const rowMargin =
            defaultBasicRowMarginHeight *
            (element.rowMargin || defaultRowMargin) *
            scale
          this.underline.recordFillInfo(
            ctx,
            x,
            // y + curRow.height,
            y + curRow.height - rowMargin,
            metrics.width,
            0,
            element.color
          )
        } else if (preElement?.underline) {
          this.underline.render(ctx)
        }
        // 删除线记录
        if (element.strikeout) {
          this.strikeout.recordFillInfo(
            ctx,
            x,
            y + curRow.height / 2,
            metrics.width
          )
        } else if (preElement?.strikeout) {
          this.strikeout.render(ctx)
        }
        // 选区记录
        const {
          zone: currentZone,
          startIndex,
          endIndex
        } = this.range.getRange()
        if (
          currentZone === zone &&
          startIndex !== endIndex &&
          startIndex <= index &&
          index <= endIndex
        ) {
          // 从行尾开始-绘制最小宽度
          if (startIndex === index) {
            const nextElement = elementList[startIndex + 1]
            if (nextElement && nextElement.value === ZERO) {
              rangeRecord.x = x + metrics.width
              rangeRecord.y = y
              rangeRecord.height = curRow.height
              rangeRecord.width += this.options.rangeMinWidth
            }
          } else {
            const positionContext = this.position.getPositionContext()
            // 表格需限定上下文
            if (
              (!positionContext.isTable && !element.tdId) ||
              positionContext.tdId === element.tdId
            ) {
              let rangeWidth = metrics.width
              // 最小选区宽度
              if (rangeWidth === 0 && curRow.elementList.length === 1) {
                rangeWidth = this.options.rangeMinWidth
              }
              // 记录第一次位置、行高
              if (!rangeRecord.width) {
                rangeRecord.x = x
                rangeRecord.y = y
                rangeRecord.height = curRow.height
              }
              rangeRecord.width += rangeWidth
            }
          }
        }
        index++
        // 绘制表格内元素
        if (element.type === ElementType.TABLE) {
          const tdGap = tdPadding * 2
          for (let t = 0; t < element.trList!.length; t++) {
            const tr = element.trList![t]
            for (let d = 0; d < tr.tdList!.length; d++) {
              const td = tr.tdList[d]
              this.drawRow(ctx, {
                elementList: td.value,
                positionList: td.positionList!,
                rowList: td.rowList!,
                pageNo,
                startIndex: 0,
                innerWidth: (td.width! - tdGap) * scale,
                zone
              })
            }
          }
        }
      }
      // 绘制列表样式
      if (curRow.isList) {
        this.listParticle.drawListStyle(
          ctx,
          curRow,
          positionList[curRow.startIndex]
        )
      }
      // 绘制富文本及文字
      this._drawRichText(ctx)
      // 绘制选区
      if (rangeRecord.width && rangeRecord.height) {
        const { x, y, width, height } = rangeRecord
        this.range.render(ctx, x, y, width, height)
      }
      if (
        isCrossRowCol &&
        tableRangeElement &&
        tableRangeElement.id === tableId
      ) {
        const {
          coordinate: {
            leftTop: [x, y]
          }
        } = positionList[curRow.startIndex]
        this.tableParticle.drawRange(ctx, tableRangeElement, x, y)
      }
    }
  }

  private _clearPage(pageNo: number) {
    const ctx = this.ctxList[pageNo]
    const pageDom = this.pageList[pageNo]
    ctx.clearRect(0, 0, pageDom.width, pageDom.height)
    this.blockParticle.clear()
  }

  private _drawPage(payload: IDrawPagePayload) {
    const { elementList, positionList, rowList, pageNo } = payload
    const { inactiveAlpha, pageMode, header, footer, pageNumber } = this.options
    const innerWidth = this.getInnerWidth()
    const ctx = this.ctxList[pageNo]
    // 判断当前激活区域-非正文区域时元素透明度降低
    ctx.globalAlpha = !this.zone.isMainActive() ? inactiveAlpha : 1
    this._clearPage(pageNo)
    // 绘制背景
    this.background.render(ctx)
    // 绘制页边距
    this.margin.render(ctx, pageNo)
    // 渲染元素
    const index = rowList[0].startIndex
    this.drawRow(ctx, {
      elementList,
      positionList,
      rowList,
      pageNo,
      startIndex: index,
      innerWidth,
      zone: EditorZone.MAIN
    })
    if (this.getIsPagingMode()) {
      // 绘制页眉
      if (!header.disabled) {
        this.header.render(ctx, pageNo)
      }
      // 绘制页码
      if (!pageNumber.disabled) {
        this.pageNumber.render(ctx, pageNo)
      }
      // 绘制页脚
      if (!footer.disabled) {
        this.footer.render(ctx, pageNo)
      }
    }
    // 搜索匹配绘制
    if (this.search.getSearchKeyword()) {
      this.search.render(ctx, pageNo)
    }
    // 绘制水印
    if (pageMode !== PageMode.CONTINUITY && this.options.watermark.data) {
      this.waterMark.render(ctx)
    }
    // 绘制空白占位符
    if (this.elementList.length <= 1) {
      this.placeholder.render(ctx)
    }
  }

  private _disconnectLazyRender() {
    this.lazyRenderIntersectionObserver?.disconnect()
  }

  private _lazyRender() {
    const positionList = this.position.getOriginalMainPositionList()
    const elementList = this.getOriginalMainElementList()
    this._disconnectLazyRender()
    this.lazyRenderIntersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number((<HTMLCanvasElement>entry.target).dataset.index)
          this._drawPage({
            elementList,
            positionList,
            rowList: this.pageRowList[index],
            pageNo: index
          })
        }
      })
    })
    this.pageList.forEach(el => {
      this.lazyRenderIntersectionObserver!.observe(el)
    })
  }

  private _immediateRender() {
    const positionList = this.position.getOriginalMainPositionList()
    const elementList = this.getOriginalMainElementList()
    for (let i = 0; i < this.pageRowList.length; i++) {
      this._drawPage({
        elementList,
        positionList,
        rowList: this.pageRowList[i],
        pageNo: i
      })
    }
  }

  public render(payload?: IDrawOption) {
    if (this.isDestroyed) return
    const { header, footer } = this.options
    const {
      isSubmitHistory = true,
      isSetCursor = true,
      isCompute = true,
      isLazy = true,
      isInit = false
    } = payload || {}
    let { curIndex } = payload || {}
    const innerWidth = this.getInnerWidth()
    const isPagingMode = this.getIsPagingMode()
    // Calculate Document Information
    if (isCompute) {
      if (isPagingMode) {
        // Header Information
        if (!header.disabled) {
          this.header.compute()
        }
        // Footer Information
        if (!footer.disabled) {
          this.footer.compute()
        }
      }
      // Row Information
      this.rowList = this.computeRowList(innerWidth, this.elementList)
      // Page Information
      this.pageRowList = this._computePageList()
      // Position Information
      this.position.computePositionList()
      // Search Information
      const searchKeyword = this.search.getSearchKeyword()
      if (searchKeyword) {
        this.search.compute(searchKeyword)
      }
    }
    // Clear cursor and other side effects
    this.imageObserver.clearAll()
    this.cursor.recoveryCursor()
    // Create pages
    for (let i = 0; i < this.pageRowList.length; i++) {
      if (!this.pageList[i]) {
        this._createPage(i)
      }
    }
    // Remove Redundant Pages
    const curPageCount = this.pageRowList.length
    const prePageCount = this.pageList.length
    if (prePageCount > curPageCount) {
      const deleteCount = prePageCount - curPageCount
      this.ctxList.splice(curPageCount, deleteCount)
      this.pageList
        .splice(curPageCount, deleteCount)
        .forEach(page => page.remove())
    }
    // Drawing Elements
    // Due to height variations in consecutive pages, the canvas may render blank; immediate rendering is required to prevent flickering.
    if (isLazy && isPagingMode) {
      this._lazyRender()
    } else {
      this._immediateRender()
    }
    const positionContext = this.position.getPositionContext()
    // Cursor Redraw
    if (isSetCursor) {
      const positionList = this.position.getPositionList()
      if (positionContext.isTable) {
        const { index, trIndex, tdIndex } = positionContext
        const elementList = this.getOriginalElementList()
        const tablePositionList =
          elementList[index!].trList?.[trIndex!].tdList[tdIndex!].positionList
        if (curIndex === undefined && tablePositionList) {
          curIndex = tablePositionList.length - 1
        }
        const tablePosition = tablePositionList?.[curIndex!]
        this.position.setCursorPosition(tablePosition || null)
      } else {
        this.position.setCursorPosition(
          curIndex !== undefined ? positionList[curIndex] : null
        )
      }
      this.cursor.drawCursor()
    }
    // The history log is used for undo and redo operations.
    if (isSubmitHistory) {
      const self = this
      const oldElementList = deepClone(this.elementList)
      const oldHeaderElementList = deepClone(this.header.getElementList())
      const oldFooterElementList = deepClone(this.footer.getElementList())
      const { startIndex, endIndex } = this.range.getRange()
      const pageNo = this.pageNo
      const oldPositionContext = deepClone(positionContext)
      const zone = this.zone.getZone()
      this.historyManager.execute(function () {
        self.zone.setZone(zone)
        self.setPageNo(pageNo)
        self.position.setPositionContext(deepClone(oldPositionContext))
        self.header.setElementList(deepClone(oldHeaderElementList))
        self.footer.setElementList(deepClone(oldFooterElementList))
        self.elementList = deepClone(oldElementList)
        self.range.setRange(startIndex, endIndex)
        self.render({ curIndex, isSubmitHistory: false })
      })
    }
    // Information Change Callback
    nextTick(() => {
      // Table Tool Redraw
      if (isCompute && !this.isReadonly() && positionContext.isTable) {
        this.tableTool.render()
      }
      // Header Indicator Redraw
      if (isCompute && !this.zone.isMainActive()) {
        this.zone.drawZoneIndicator()
      }
      // Page Size Change
      if (this.listener.pageSizeChange) {
        this.listener.pageSizeChange(this.pageRowList.length)
      }
      if (this.eventBus.isSubscribe('pageSizeChange')) {
        this.eventBus.emit('pageSizeChange', this.pageRowList.length)
      }
      // Document Content Change
      if (isSubmitHistory && !isInit) {
        if (this.listener.contentChange) {
          this.listener.contentChange()
        }
        if (this.eventBus.isSubscribe('contentChange')) {
          this.eventBus.emit('contentChange')
        }
      }
    })
  }

  public destroy() {
    this.isDestroyed = true
    this.container.remove()
    this.globalEvent.removeEvent()
    this.scrollObserver.removeEvent()
    this.selectionObserver.removeEvent()
  }
  public splitTableRowsByAvailableHeight(
    tableElement: IElement,
    elementList: IElement[],
    tableIndex: number,
    deleteStart: number,
    occupiedPageHeight: number
  ) {}

  private splitTrListByPageHeight(
    tdList: ITd[],
    availablePageHeight: number
  ): [ITd[], ITd[]] {
    const currentPageTdList: ITd[] = []

    const nextPageTdList: ITd[] = []

    const currentPageNo = ((tdList[0] || []) as any)?.(
      positionList[0] || []
    )?.pageNo
    const nextPageNo = currentPageNo + 1
    for (const td of tdList) {
      const currentTd = deepClone(td)

      const nextTd = deepClone(td)

      const currentRowList: IRow[] = []

      const overflowRowList: IRow[] = []

      let accumulatedHeight = 0

      for (const row of td.rowList || []) {
        const rowHeight = row.height || 0

        const canFitInCurrentPage =
          accumulatedHeight + rowHeight <= availablePageHeight

        if (canFitInCurrentPage) {
          currentRowList.push(row)

          accumulatedHeight += rowHeight
        } else {
          overflowRowList.push(row)
        }
      }

      // -----------------------------------
      // Current Page TD
      // -----------------------------------

      currentTd.rowList = this.updateRowList(currentRowList)

      currentTd.value = this.rebuildValueFromRowList(currentTd.rowList)

      currentTd.positionList = this.rebuildPositionListFromRowList(
        currentTd.rowList,
        currentPageNo
      )

      currentTd.height = this.calculateRowListHeight(currentTd.rowList)

      currentTd.mainHeight = currentTd.height

      currentTd.realHeight = currentTd.height

      currentTd.realMinHeight = currentTd.height

      // -----------------------------------
      // Next Page TD
      // -----------------------------------

      nextTd.rowList = this.updateRowList(overflowRowList)

      nextTd.value = overflowRowList.length
        ? this.rebuildValueFromRowList(nextTd.rowList)
        : [{ value: '' }]

      nextTd.positionList = this.rebuildPositionListFromRowList(
        nextTd.rowList,
        nextPageNo
      )

      nextTd.height = this.calculateRowListHeight(nextTd.rowList)

      nextTd.mainHeight = nextTd.height

      nextTd.realHeight = nextTd.height

      nextTd.realMinHeight = nextTd.height

      currentPageTdList.push(currentTd)

      nextPageTdList.push(nextTd)
    }

    return [currentPageTdList, nextPageTdList]
  }

  private updateRowList(rowList: ITr[]): ITr[] {
    return rowList.map((row, rowIndex) => {
      return {
        ...row,
        startIndex: rowIndex,
        isPageBreak: false
      }
    })
  }

  private rebuildValueFromRowList(rowList: ITr[]): IElement[] {
    return rowList.flatMap(row =>
      (row.elementList || []).map(element => ({
        ...element
      }))
    )
  }

  private rebuildPositionListFromRowList(
    rowList: IRow[],
    pageNo: number
  ): IElementPosition[] {
    const positionList: IElementPosition[] = []

    let globalIndex = 0

    rowList.forEach((row, rowNo) => {
      const elementList = row.elementList || []

      elementList.forEach((element, elementIndex) => {
        const position = {
          ...(element.position || {})
        }

        position.pageNo = pageNo

        position.rowNo = rowNo

        position.rowIndex = rowNo

        position.index = globalIndex

        position.isFirstLetter = elementIndex === 0

        position.isLastLetter = elementIndex === elementList.length - 1

        positionList.push(position)

        globalIndex++
      })
    })

    return positionList
  }

  private calculateRowListHeight(rowList: ITr[]): number {
    return rowList.reduce(
      (totalHeight, row) => totalHeight + (row.height || 0),
      0
    )
  }
}
