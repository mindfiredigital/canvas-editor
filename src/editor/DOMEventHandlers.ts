import Editor, {
  EditorMode,
  ICatalog,
  IEditorData,
  IEditorOption,
  IElement,
  IWatermark,
  ImageDisplay,
  INavigateInfo,
  ListStyle,
  ListType,
  PageMode,
  PaperDirection,
  RowFlex,
  TableBorder,
  TitleLevel,
  VerticalAlign
} from '.'
import en from '../editor/core/i18n/lang/en.json'
import {
  IAppendElementListOption,
  IDrawImagePayload,
  IGetValueOption,
  IPainterOption
} from './interface/Draw'
import { IEditorHTML } from './interface/Editor'
import { IMargin } from './interface/Margin'
import { RangeContext } from './interface/Range'

export class DOMEventHandlers {
  private static instance: Editor

  private static getCommand() {
    return DOMEventHandlers.getEditorInstance().command
  }

  static getEditorInstance(): Editor {
    if (!DOMEventHandlers.instance) {
      throw new Error(
        `Editor is not yet registered. Make sure initialization registers editor prior to usage.`
      )
    }
    return DOMEventHandlers.instance
  }

  static register(
    container: HTMLDivElement,
    data: IEditorData | IElement[],
    options: IEditorOption = {}
  ): Editor {
    // if (DOMEventHandlers.instance) {
    //   console.log('tried to register again. Returning')
    //   return
    // }
    if (DOMEventHandlers.instance) {
      try {
        DOMEventHandlers.instance.destroy()
      } catch (e) {
        console.warn('Cleaning up old editor instance')
      }
    }
    DOMEventHandlers.instance = new Editor(container, data, options)
    DOMEventHandlers.getCommand().executeSetLocale('en')
    DOMEventHandlers.instance.register.langMap('en', en)

    return DOMEventHandlers.instance
  }

  static handleUndo() {
    DOMEventHandlers.undo()
  }

  static handleRedo() {
    DOMEventHandlers.redo()
  }

  static handleBold() {
    DOMEventHandlers.bold()
  }

  static handleItalic() {
    DOMEventHandlers.italic()
  }

  static handleUnderline() {
    DOMEventHandlers.underline()
  }

  static handleStrikeout() {
    DOMEventHandlers.strikeout()
  }

  static handleSuperscript() {
    DOMEventHandlers.superscript()
  }

  static handleSubscript() {
    DOMEventHandlers.subscript()
  }

  static handleFontFamily(fontFamily: string) {
    DOMEventHandlers.font(fontFamily)
  }

  static handleAlign(alignment: RowFlex) {
    DOMEventHandlers.rowFlex(alignment)
  }

  static handleList(listType: ListType | null, listStyle?: ListStyle) {
    DOMEventHandlers.list(listType, listStyle)
  }

  static setFontColor(payload: string) {
    DOMEventHandlers.color(payload)
  }

  static highlightText(payload: string) {
    DOMEventHandlers.highlight(payload)
  }

  static setFont(payload: string) {
    DOMEventHandlers.font(payload)
  }

  static setSize(payload: number) {
    DOMEventHandlers.size(payload)
  }

  static increaseFontSize() {
    DOMEventHandlers.sizeAdd()
  }

  static decreaseFontSize() {
    DOMEventHandlers.sizeMinus()
  }

  static getContent() {
    return DOMEventHandlers.getValue()
  }

  static setContent(payload: Partial<IEditorData>) {
    DOMEventHandlers.setValue(payload)
  }

  static createTable(payload: { rowIndex: number; colIndex: number }) {
    DOMEventHandlers.insertTable(payload.rowIndex, payload.colIndex)
  }

  static setTitle(payload: TitleLevel | null) {
    DOMEventHandlers.title(payload)
  }

  static getContentStyles() {
    return DOMEventHandlers.getCommand().getContentStyles()
  }

  static setImage(payload: IDrawImagePayload) {
    DOMEventHandlers.image(payload)
  }

  static createHyperLink() {
    DOMEventHandlers.globalHyperlink()
  }

  static createGlobalHyperLink() {
    DOMEventHandlers.globalHyperlink()
  }

  static setHorizontalLine(payload: number[]) {
    DOMEventHandlers.separator(payload)
  }

  static setPaperMargins(payload: number[]) {
    const [topMargin, bottomMargin, leftMargin, rightMargin] = payload
    DOMEventHandlers.setPaperMargin([
      Number(topMargin),
      Number(rightMargin),
      Number(bottomMargin),
      Number(leftMargin)
    ])
  }

  static getSelectedText() {
    return DOMEventHandlers.getRangeText()
  }

  static insertElement(payload: string) {
    DOMEventHandlers.insertElementList([{ value: payload }])
  }

  static mode(payload: EditorMode) {
    DOMEventHandlers.getCommand().executeMode(payload)
  }

  static cut() {
    DOMEventHandlers.getCommand().executeCut()
  }

  static copy() {
    DOMEventHandlers.getCommand().executeCopy()
  }

  static async paste() {
    return DOMEventHandlers.getCommand().executePaste()
  }

  static selectAll() {
    DOMEventHandlers.getCommand().executeSelectAll()
  }

  static backspace() {
    DOMEventHandlers.getCommand().executeBackspace()
  }

  static setRange(startIndex: number, endIndex: number) {
    DOMEventHandlers.getCommand().executeSetRange(startIndex, endIndex)
  }

  static undo() {
    DOMEventHandlers.getCommand().executeUndo()
  }

  static redo() {
    DOMEventHandlers.getCommand().executeRedo()
  }

  static painter(options: IPainterOption) {
    DOMEventHandlers.getCommand().executePainter(options)
  }

  static applyPainterStyle() {
    DOMEventHandlers.getCommand().executeApplyPainterStyle()
  }

  static format() {
    DOMEventHandlers.getCommand().executeFormat()
  }

  static font(payload: string) {
    DOMEventHandlers.getCommand().executeFont(payload)
  }

  static size(payload: number) {
    DOMEventHandlers.getCommand().executeSize(payload)
  }

  static sizeAdd() {
    DOMEventHandlers.getCommand().executeSizeAdd()
  }

  static sizeMinus() {
    DOMEventHandlers.getCommand().executeSizeMinus()
  }

  static bold() {
    DOMEventHandlers.getCommand().executeBold()
  }

  static italic() {
    DOMEventHandlers.getCommand().executeItalic()
  }

  static underline() {
    DOMEventHandlers.getCommand().executeUnderline()
  }

  static strikeout() {
    DOMEventHandlers.getCommand().executeStrikeout()
  }

  static superscript() {
    DOMEventHandlers.getCommand().executeSuperscript()
  }

  static subscript() {
    DOMEventHandlers.getCommand().executeSubscript()
  }

  static color(payload: string) {
    DOMEventHandlers.getCommand().executeColor(payload)
  }

  static highlight(payload: string) {
    DOMEventHandlers.getCommand().executeHighlight(payload)
  }

  static title(payload: TitleLevel | null) {
    DOMEventHandlers.getCommand().executeTitle(payload)
  }

  static list(listType: ListType | null, listStyle?: ListStyle) {
    DOMEventHandlers.getCommand().executeList(listType, listStyle)
  }

  static rowFlex(payload: RowFlex) {
    DOMEventHandlers.getCommand().executeRowFlex(payload)
  }

  static rowMargin(payload: number) {
    DOMEventHandlers.getCommand().executeRowMargin(payload)
  }

  static insertTable(row: number, col: number) {
    DOMEventHandlers.getCommand().executeInsertTable(row, col)
  }

  static insertTableTopRow() {
    DOMEventHandlers.getCommand().executeInsertTableTopRow()
  }

  static insertTableBottomRow() {
    DOMEventHandlers.getCommand().executeInsertTableBottomRow()
  }

  static insertTableLeftCol() {
    DOMEventHandlers.getCommand().executeInsertTableLeftCol()
  }

  static insertTableRightCol() {
    DOMEventHandlers.getCommand().executeInsertTableRightCol()
  }

  static deleteTableRow() {
    DOMEventHandlers.getCommand().executeDeleteTableRow()
  }

  static deleteTableCol() {
    DOMEventHandlers.getCommand().executeDeleteTableCol()
  }

  static deleteTable() {
    DOMEventHandlers.getCommand().executeDeleteTable()
  }

  static mergeTableCell() {
    DOMEventHandlers.getCommand().executeMergeTableCell()
  }

  static cancelMergeTableCell() {
    DOMEventHandlers.getCommand().executeCancelMergeTableCell()
  }

  static tableTdVerticalAlign(payload: VerticalAlign) {
    DOMEventHandlers.getCommand().executeTableTdVerticalAlign(payload)
  }

  static tableBorderType(payload: TableBorder) {
    DOMEventHandlers.getCommand().executeTableBorderType(payload)
  }

  static tableTdBackgroundColor(payload: string) {
    DOMEventHandlers.getCommand().executeTableTdBackgroundColor(payload)
  }

  static tableTdBorderBgTop(payload: string) {
    DOMEventHandlers.getCommand().executeTableTdBorderBgTop(payload)
  }

  static tableTdBorderBgBottom(payload: string) {
    DOMEventHandlers.getCommand().executeTableTdBorderBgBottom(payload)
  }

  static tableTdBorderBgLeft(payload: string) {
    DOMEventHandlers.getCommand().executeTableTdBorderBgLeft(payload)
  }

  static tableTdBorderBgRight(payload: string) {
    DOMEventHandlers.getCommand().executeTableTdBorderBgRight(payload)
  }

  static tableTdBorderWidthTop(payload: number) {
    DOMEventHandlers.getCommand().executeTableTdBorderWidthTop(payload)
  }

  static tableTdBorderWidthLeft(payload: number) {
    DOMEventHandlers.getCommand().executeTableTdBorderWidthLeft(payload)
  }

  static tableTdBorderWidthBottom(payload: number) {
    DOMEventHandlers.getCommand().executeTableTdBorderWidthBottom(payload)
  }

  static tableTdBorderWidthRight(payload: number) {
    DOMEventHandlers.getCommand().executeTableTdBorderWidthRight(payload)
  }

  static hyperlink(payload: IElement) {
    DOMEventHandlers.getCommand().executeHyperlink(payload)
  }

  static getHyperlinkRange(): [number, number] | null {
    return DOMEventHandlers.getCommand().getHyperlinkRange()
  }

  static deleteHyperlink() {
    DOMEventHandlers.getCommand().executeDeleteHyperlink()
  }

  static cancelHyperlink() {
    DOMEventHandlers.getCommand().executeCancelHyperlink()
  }

  static editHyperlink(url: string) {
    DOMEventHandlers.getCommand().executeEditHyperlink(url)
  }

  static separator(payload: number[]) {
    DOMEventHandlers.getCommand().executeSeparator(payload)
  }

  static pageBreak() {
    DOMEventHandlers.getCommand().executePageBreak()
  }

  static addWatermark(payload: IWatermark) {
    DOMEventHandlers.getCommand().executeAddWatermark(payload)
  }

  static deleteWatermark() {
    DOMEventHandlers.getCommand().executeDeleteWatermark()
  }

  static image(payload: IDrawImagePayload) {
    DOMEventHandlers.getCommand().executeImage(payload)
  }

  static search(payload: string | null) {
    DOMEventHandlers.getCommand().executeSearch(payload)
  }

  static searchNavigatePre() {
    DOMEventHandlers.getCommand().executeSearchNavigatePre()
  }

  static searchNavigateNext() {
    DOMEventHandlers.getCommand().executeSearchNavigateNext()
  }

  static getSearchNavigateInfo(): INavigateInfo | null {
    return DOMEventHandlers.getCommand().getSearchNavigateInfo()
  }

  static replace(payload: string) {
    DOMEventHandlers.getCommand().executeReplace(payload)
  }

  static async print() {
    return DOMEventHandlers.getCommand().executePrint()
  }

  static replaceImageElement(payload: string) {
    DOMEventHandlers.getCommand().executeReplaceImageElement(payload)
  }

  static saveAsImageElement() {
    DOMEventHandlers.getCommand().executeSaveAsImageElement()
  }

  static changeImageDisplay(element: IElement, display: ImageDisplay) {
    DOMEventHandlers.getCommand().executeChangeImageDisplay(element, display)
  }

  static getImage(pixelRatio?: number): Promise<string[]> {
    return DOMEventHandlers.getCommand().getImage(pixelRatio)
  }

  static getValue(options?: IGetValueOption) {
    return DOMEventHandlers.getCommand().getValue(options)
  }

  static getHTML(): IEditorHTML {
    return DOMEventHandlers.getCommand().getHTML()
  }

  static getWordCount(): Promise<number> {
    return DOMEventHandlers.getCommand().getWordCount()
  }

  static getRangeText(): string {
    return DOMEventHandlers.getCommand().getRangeText()
  }

  static getRangeContext(): RangeContext | null {
    return DOMEventHandlers.getCommand().getRangeContext()
  }

  static pageMode(payload: PageMode) {
    DOMEventHandlers.getCommand().executePageMode(payload)
  }

  static pageScaleRecovery() {
    DOMEventHandlers.getCommand().executePageScaleRecovery()
  }

  static pageScaleMinus() {
    DOMEventHandlers.getCommand().executePageScaleMinus()
  }

  static pageScaleAdd() {
    DOMEventHandlers.getCommand().executePageScaleAdd()
  }

  static paperSize(width: number, height: number) {
    DOMEventHandlers.getCommand().executePaperSize(width, height)
  }

  static paperDirection(payload: PaperDirection) {
    DOMEventHandlers.getCommand().executePaperDirection(payload)
  }

  static getPaperMargin(): number[] {
    return DOMEventHandlers.getCommand().getPaperMargin()
  }

  static setPaperMargin(payload: IMargin) {
    DOMEventHandlers.getCommand().executeSetPaperMargin(payload)
  }

  static insertElementList(payload: IElement[]) {
    DOMEventHandlers.getCommand().executeInsertElementList(payload)
  }

  static appendElementList(
    elementList: IElement[],
    options?: IAppendElementListOption
  ) {
    DOMEventHandlers.getCommand().executeAppendElementList(elementList, options)
  }

  static setValue(payload: Partial<IEditorData>) {
    DOMEventHandlers.getCommand().executeSetValue(payload)
  }

  static removeControl() {
    DOMEventHandlers.getCommand().executeRemoveControl()
  }

  static setLocale(payload: string) {
    DOMEventHandlers.getCommand().executeSetLocale(payload)
  }

  static getCatalog(): Promise<ICatalog | null> {
    return DOMEventHandlers.getCommand().getCatalog()
  }

  static locationCatalog(titleId: string) {
    DOMEventHandlers.getCommand().executeLocationCatalog(titleId)
  }

  static wordTool() {
    DOMEventHandlers.getCommand().executeWordTool()
  }

  static globalHyperlink() {
    DOMEventHandlers.getCommand().executeGlobalHyperlink()
  }
}
