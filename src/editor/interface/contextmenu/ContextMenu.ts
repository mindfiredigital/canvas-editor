import { Command } from '../../core/command/Command'
import { IElement } from '../Element'

export interface IContextMenuContext {
  startElement: IElement | null
  endElement: IElement | null
  isReadonly: boolean
  editorHasSelection: boolean
  editorTextFocus: boolean
  isInTable: boolean
  isCrossRowCol: boolean
}

export interface IRegisterContextMenu {
  i18nPath?: string
  isDivider?: boolean
  icon?: string
  name?: string
  shortCut?: string
  when?: (payload: IContextMenuContext) => boolean
  callback?: (command: Command, context: IContextMenuContext) => any
  childMenus?: IRegisterContextMenu[]
}

export interface IContextmenuLang {
  global: {
    cut: string
    copy: string
    paste: string
    selectAll: string
    print: string
    hyperlink: string
  }
  control: {
    delete: string
  }
  hyperlink: {
    delete: string
    cancel: string
    edit: string
  }
  image: {
    change: string
    saveAs: string
    textWrap: string
    textWrapType: {
      embed: string
      upDown: string
    }
  }
  table: {
    insertRowCol: string
    insertTopRow: string
    insertBottomRow: string
    insertLeftCol: string
    insertRightCol: string
    deleteRowCol: string
    deleteRow: string
    deleteCol: string
    deleteTable: string
    mergeCell: string
    mergeCancelCell: string
  }
}
