import { getExternalLabelMid, hasExternalLabel, setLabel } from 'bpmn-js/lib/util/LabelUtil'
import { isLabel } from 'diagram-js/lib/util/ModelUtil'
import { getLabel } from 'bpmn-js/lib/features/label-editing/LabelUtil'
import { is } from 'bpmn-js/lib/util/ModelUtil'

import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
import TextRenderer from 'bpmn-js/lib/draw/TextRenderer'
import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory'

const NULL_DIMENSIONS = {
  width: 0,
  height: 0
}

class UpdateExternalLabelHandler {
  private _bpmnFactory: BpmnFactory
  private _modeling: Modeling
  private _textRenderer: TextRenderer
  static $inject: string[]
  constructor(modeling: Modeling, textRenderer: TextRenderer, bpmnFactory: BpmnFactory) {
    this._modeling = modeling
    this._textRenderer = textRenderer
    this._bpmnFactory = bpmnFactory
  }

  preExecute(ctx) {
    const element = ctx.element,
      businessObject = element.businessObject,
      newLabel = ctx.newLabel

    if (!isLabel(element) && !hasExternalLabel(element) && !isEmptyText(newLabel)) {
      // create label
      const paddingTop = 7

      let labelCenter = getExternalLabelMid(element)

      labelCenter = {
        x: labelCenter.x,
        y: labelCenter.y + paddingTop
      }

      this._modeling.createLabel(element, labelCenter, {
        id: businessObject.id + '_label',
        businessObject: businessObject,
        di: element.di
      })
    }
  }

  execute(ctx) {
    ctx.oldLabel = getLabel(ctx.element)
    return setText(ctx.element, ctx.newLabel)
  }

  revert(ctx) {
    return setText(ctx.element, ctx.oldLabel)
  }

  postExecute(ctx) {
    const element = ctx.element,
      label = element.label || element,
      hints = ctx.hints || {},
      newLabel = ctx.newLabel
    let newBounds = ctx.newBounds

    // ignore internal labels for elements except text annotations
    if (!isLabel(label) && !is(label, 'bpmn:TextAnnotation')) {
      return
    }

    if (isLabel(label) && isEmptyText(newLabel)) {
      if (hints.removeShape !== false) {
        this._modeling.removeShape(label, { unsetLabel: false })
      }

      return
    }

    const text = getLabel(element)

    // resize element based on label _or_ pre-defined bounds
    if (typeof newBounds === 'undefined') {
      newBounds = this._textRenderer.getExternalLabelBounds(label, text)
    }

    // setting newBounds to false or _null_ will
    // disable the postExecute resize operation
    if (newBounds) {
      this._modeling.resizeShape(label, newBounds, NULL_DIMENSIONS)
    }
  }
}

UpdateExternalLabelHandler.$inject = ['modeling', 'textRenderer', 'bpmnFactory']

// helpers //////////

function setText(element: BpmnElement, text: string) {
  // external label if present
  const label = element.label || element

  const labelTarget = element.labelTarget || element

  setLabel(label as BpmnElement, text)

  return [label, labelTarget]
}
function isEmptyText(label) {
  return !label || !label.trim()
}

export default UpdateExternalLabelHandler
