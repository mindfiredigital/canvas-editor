import { NAME_PLACEHOLDER } from '../../dataset/constant/ContextMenu'
import { EDITOR_COMPONENT, EDITOR_PREFIX } from '../../dataset/constant/Editor'
import { EditorComponent } from '../../dataset/enum/Editor'
import {
  IContextMenuContext,
  IRegisterContextMenu
} from '../../interface/contextmenu/ContextMenu'
import { findParent } from '../../utils'
import { Command } from '../command/Command'
import { Draw } from '../draw/Draw'
import { I18n } from '../i18n/I18n'
import { Position } from '../position/Position'
import { RangeManager } from '../range/RangeManager'
import { controlMenus } from './menus/controlMenus'
import { globalMenus } from './menus/globalMenus'
import { hyperlinkMenus } from './menus/hyperlinkMenus'
import { imageMenus } from './menus/imageMenus'
import { tableMenus } from './menus/tableMenus'

interface IRenderPayload {
  contextMenuList: IRegisterContextMenu[]
  left: number
  top: number
  parentMenuContainer?: HTMLDivElement
}

export class ContextMenu {
  private draw: Draw
  private command: Command
  private range: RangeManager
  private position: Position
  private i18n: I18n
  private container: HTMLDivElement
  private contextMenuList: IRegisterContextMenu[]
  private contextMenuContainerList: HTMLDivElement[]
  private contextMenuRelationShip: Map<HTMLDivElement, HTMLDivElement>
  private context: IContextMenuContext | null

  constructor(draw: Draw, command: Command) {
    this.draw = draw
    this.command = command
    this.range = draw.getRange()
    this.position = draw.getPosition()
    this.i18n = draw.getI18n()
    this.container = draw.getContainer()
    this.context = null
    // internal menu
    this.contextMenuList = [
      ...globalMenus,
      ...tableMenus,
      ...imageMenus,
      ...controlMenus,
      ...hyperlinkMenus
    ]
    this.contextMenuContainerList = []
    this.contextMenuRelationShip = new Map()
    this._addEvent()
  }

  private _addEvent() {
    // menu permissions
    this.container.addEventListener('contextmenu', this._proxyContextMenuEvent)
    document.addEventListener('mousedown', this._handleEffect)
  }

  public removeEvent() {
    this.container.removeEventListener(
      'contextmenu',
      this._proxyContextMenuEvent
    )
    document.removeEventListener('mousedown', this._handleSideEffect)
  }

  private _proxyContextMenuEvent = (evt: MouseEvent) => {
    this.context = this._getContext()
    const renderList: IRegisterContextMenu[] = []
    let isRegisterContextMenu = false
    for (let c = 0; c < this.contextMenuList.length; c++) {
      const menu = this.contextMenuList[c]
      if (menu.isDivider) {
        renderList.push(menu)
      } else {
        const isMatch = menu.when?.(this.context)
        if (isMatch) {
          renderList.push(menu)
          isRegisterContextMenu = true
        }
      }
    }
    if (isRegisterContextMenu) {
      this.dispose()
      this._render({
        contextMenuList: renderList,
        left: evt.x,
        top: evt.y
      })
    }
    evt.preventDefault()
  }

  private _handleSideEffect = (evt: MouseEvent) => {
    if (this.contextMenuContainerList.length) {
      // right-click menu
      const target = <Element>(evt?.composedPath()[0] || evt.target)
      const contextMenuDom = findParent(
        target,
        (node: Node & Element) =>
          !!node &&
          node.nodeType === 1 &&
          node.getAttribute(EDITOR_COMPONENT) === EditorComponent.CONTEXTMENU,
        true
      )
      if (!contextMenuDom) {
        this.dispose()
      }
    }
  }

  private _getContext(): IContextMenuContext {
    const isReadonly = this.draw.isReadonly()
    const {
      isCrossRowCol: crossRowCol,
      startIndex,
      endIndex
    } = this.range.getRange()
    const editorTextFocus = !!(~startIndex || ~endIndex)
    const editorHasSelection = editorTextFocus && startIndex !== endIndex

    const positionContext = this.position.getPositionContext()
    const isInTable = positionContext.isTable
    const isCrossRowCol = isInTable && !!crossRowCol
    // current element
    const elementList = this.draw.getElementList()
    const startElement = elementList[startIndex] || null
    const endElement = elementList[endIndex] || null

    return {
      startElement,
      endElement,
      isReadonly,
      editorHasSelection,
      editorTextFocus,
      isInTable,
      isCrossRowCol
    }
  }

  private _createContextMenuContainer(): HTMLDivElement {
    const contextMenuContainer = document.createElement('div')
    contextMenuContainer.classList.add(`${EDITOR_PREFIX}-contextmenu-container`)
    contextMenuContainer.setAttribute(
      EDITOR_COMPONENT,
      EditorComponent.CONTEXTMENU
    )
    this.container.append(contextMenuContainer)
    return contextMenuContainer
  }

  private _render(payload: IRenderPayload): HTMLDivElement {
    const { contextMenuList, left, top, parentMenuContainer } = payload
    const contextMenuContainer = this._createContextMenuContainer()
    const contextMenuContent = document.createElement('div')
    contextMenuContent.classList.add(`${EDITOR_PREFIX}-contextmenu-content`)
    // direct submenu
    let childMenuContainer: HTMLDivElement | null = null
    // Parent menu adds submenu mapping relationship
    if (parentMenuContainer) {
      this.contextMenuRelationShip.set(
        parentMenuContainer,
        contextMenuContainer
      )
    }
    for (let c = 0; c < contextMenuList.length; c++) {
      const menu = contextMenuList[c]
      if (menu.isDivider) {
        // The first and last delimiters are not rendered
        if (c !== 0 && c !== contextMenuList.length - 1) {
          const divider = document.createElement('div')
          divider.classList.add(`${EDITOR_PREFIX}-contextmenu-divider`)
          contextMenuContent.append(divider)
        }
      } else {
        const menuItem = document.createElement('div')
        menuItem.classList.add(`${EDITOR_PREFIX}-contextmenu-item`)
        // menu event
        if (menu.childMenus) {
          menuItem.classList.add(`${EDITOR_PREFIX}-contextmenu-sub-item`)
          menuItem.onmouseenter = () => {
            this._setHoverStatus(menuItem, true)
            this._removeSubMenu(contextMenuContainer)
            // 子菜单
            const subMenuRect = menuItem.getBoundingClientRect()
            const left = subMenuRect.left + subMenuRect.width
            const top = subMenuRect.top
            childMenuContainer = this._render({
              contextMenuList: menu.childMenus!,
              left,
              top,
              parentMenuContainer: contextMenuContainer
            })
          }
          menuItem.onmouseleave = evt => {
            // Move to the submenu option selected state does not change
            if (
              !childMenuContainer ||
              !childMenuContainer.contains(evt.relatedTarget as Node)
            ) {
              this._setHoverStatus(menuItem, false)
            }
          }
        } else {
          menuItem.onmouseenter = () => {
            this._setHoverStatus(menuItem, true)
            this._removeSubMenu(contextMenuContainer)
          }
          menuItem.onmouseleave = () => {
            this._setHoverStatus(menuItem, false)
          }
          menuItem.onclick = () => {
            if (menu.callback && this.context) {
              menu.callback(this.command, this.context)
            }
            this.dispose()
          }
        }
        // 图标
        const icon = document.createElement('i')
        menuItem.append(icon)
        if (menu.icon) {
          icon.classList.add(`${EDITOR_PREFIX}-contextmenu-${menu.icon}`)
        }
        // 文本
        const span = document.createElement('span')
        const name = menu.i18nPath
          ? this._formatName(this.i18n.t(menu.i18nPath))
          : this._formatName(menu.name || '')
        span.append(document.createTextNode(name))
        menuItem.append(span)
        // 快捷方式提示
        if (menu.shortCut) {
          const span = document.createElement('span')
          span.classList.add(`${EDITOR_PREFIX}-shortcut`)
          span.append(document.createTextNode(menu.shortCut))
          menuItem.append(span)
        }
        contextMenuContent.append(menuItem)
      }
    }
    contextMenuContainer.append(contextMenuContent)
    contextMenuContainer.style.display = 'block'
    const innerWidth = window.innerWidth
    const contextMenuWidth = contextMenuContainer.getBoundingClientRect().width
    // 右侧空间不足时，以菜单右上角作为起始点
    const adjustLeft =
      left + contextMenuWidth > innerWidth ? left - contextMenuWidth : left
    contextMenuContainer.style.left = `${adjustLeft}px`
    contextMenuContainer.style.top = `${top}px`
    this.contextMenuContainerList.push(contextMenuContainer)
    return contextMenuContainer
  }

  private _removeSubMenu(payload: HTMLDivElement) {
    const childMenu = this.contextMenuRelationShip.get(payload)
    if (childMenu) {
      this._removeSubMenu(childMenu)
      childMenu.remove()
      this.contextMenuRelationShip.delete(payload)
    }
  }

  private _setHoverStatus(payload: HTMLDivElement, status: boolean) {
    if (status) {
      payload.parentNode
        ?.querySelectorAll(`${EDITOR_PREFIX}-contextmenu-item`)
        .forEach(child => child.classList.remove('hover'))
      payload.classList.add('hover')
    } else {
      payload.classList.remove('hover')
    }
  }

  private _formatName(name: string): string {
    const placeholderValues = Object.values(NAME_PLACEHOLDER)
    const placeholderReg = new RegExp(`${placeholderValues.join('|')}`)
    let formatName = name
    if (placeholderReg.test(formatName)) {
      // 选区名称
      const selectedReg = new RegExp(NAME_PLACEHOLDER.SELECTED_TEXT, 'g')
      if (selectedReg.test(formatName)) {
        const selectedText = this.range.toString()
        formatName = formatName.replace(selectedReg, selectedText)
      }
    }
    return formatName
  }

  public registerContextMenuList(payload: IRegisterContextMenu[]) {
    this.contextMenuList.push(...payload)
  }

  public dispose() {
    this.contextMenuContainerList.forEach(child => child.remove())
    this.contextMenuContainerList = []
    this.contextMenuRelationShip.clear()
  }
}
