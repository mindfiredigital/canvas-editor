import { CanvasEvent } from '../CanvasEvent'
import { input, removeComposingInput } from './input'

function compositionstart(host: CanvasEvent) {
  host.isComposing = true
}

function compositionend(host: CanvasEvent, evt: CompositionEvent) {
  host.isComposing = false
  // Handle input box closing
  const draw = host.getDraw()
  // Nonexistent value: remove synthetic input
  if (!evt.data) {
    removeComposingInput(host)
    const rangeManager = draw.getRange()
    const { endIndex: curIndex } = rangeManager.getRange()
    draw.render({
      curIndex,
      isSubmitHistory: false
    })
  } else {
    // 存在值：无法触发input事件需手动检测并触发渲染
    setTimeout(() => {
      if (host.compositionInfo) {
        input(evt.data, host)
      }
    })
  }
  // 移除代理输入框数据
  const cursor = draw.getCursor()
  cursor.clearAgentDomValue()
}

export default {
  compositionstart,
  compositionend
}
