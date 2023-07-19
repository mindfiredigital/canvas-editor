import { ControlComponent } from '../../../../dataset/enum/Control'
import { KeyMap } from '../../../../dataset/enum/KeyMap'
import { IControlInstance } from '../../../../interface/Control'
import { IElement } from '../../../../interface/Element'
import { Control } from '../Control'

export class CheckboxControl implements IControlInstance {
  private element: IElement
  private control: Control

  constructor(element: IElement, control: Control) {
    this.element = element
    this.control = control
  }

  public getElement(): IElement {
    return this.element
  }

  public getCode(): string | null {
    return this.element.control?.code || null
  }

  public getValue(): IElement[] {
    console.log('getValue')
    
    const elementList = this.control.getElementList()
    const { startIndex } = this.control.getRange()
    const startElement = elementList[startIndex]
    const data: IElement[] = []
    // look left
    let preIndex = startIndex
    while (preIndex > 0) {
      const preElement = elementList[preIndex]
      if (
        preElement.controlId !== startElement.controlId ||
        preElement.controlComponent === ControlComponent.PREFIX
      ) {
        break
      }
      if (preElement.controlComponent === ControlComponent.VALUE) {
        data.unshift(preElement)
      }
      preIndex--
    }
    // find right
    let nextIndex = startIndex + 1
    while (nextIndex < elementList.length) {
      const nextElement = elementList[nextIndex]
      if (
        nextElement.controlId !== startElement.controlId ||
        nextElement.controlComponent === ControlComponent.POSTFIX
      ) {
        break
      }
      if (nextElement.controlComponent === ControlComponent.VALUE) {
        data.push(nextElement)
      }
      nextIndex++
    }
    return data
  }

  public setValue(): number {
    return -1
  }

  public setSelect() {
    const { control } = this.element
    const elementList = this.control.getElementList()
    const { startIndex } = this.control.getRange()
    const startElement = elementList[startIndex]
    const data: string[] = []
    // look left
    let preIndex = startIndex
    while (preIndex > 0) {
      const preElement = elementList[preIndex]
      if (
        preElement.controlId !== startElement.controlId ||
        preElement.controlComponent === ControlComponent.PREFIX
      ) {
        break
      }
      if (preElement.controlComponent === ControlComponent.CHECKBOX) {
        const checkbox = preElement.checkbox
        if (checkbox && checkbox.value && checkbox.code) {
          data.unshift(checkbox.code)
        }
      }
      preIndex--
    }
    // find right
    let nextIndex = startIndex + 1
    while (nextIndex < elementList.length) {
      const nextElement = elementList[nextIndex]
      if (
        nextElement.controlId !== startElement.controlId ||
        nextElement.controlComponent === ControlComponent.POSTFIX
      ) {
        break
      }
      if (nextElement.controlComponent === ControlComponent.CHECKBOX) {
        const checkbox = nextElement.checkbox
        if (checkbox && checkbox.value && checkbox.code) {
          data.push(checkbox.code)
        }
      }
      nextIndex++
    }
    control!.code = data.join(',')
  }

  public keydown(evt: KeyboardEvent): number {
    console.log('keydown11')
    
    const range = this.control.getRange()
    // Shrink bounds to Value
    this.control.shrinkBoundary()
    const { startIndex, endIndex } = range
    // delete
    if (evt.key === KeyMap.Backspace || evt.key === KeyMap.Delete) {
      return this.control.removeControl(startIndex)
    }
    return endIndex
  }

  public cut(): number {
    return -1
  }
}
