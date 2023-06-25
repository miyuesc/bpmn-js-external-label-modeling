import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
import UpdateExternalLabelHandler from './UpdateExternalLabelHandler'

class ExternalLabelModeling extends Modeling {
  constructor(eventBus, elementFactory, commandStack, bpmnRules) {
    super(eventBus, elementFactory, commandStack, bpmnRules)
  }

  getHandlers(): typeof Modeling.prototype.getHandlers {
    const handlers = Modeling.prototype.getHandlers.call(this)

    handlers['element.updateLabel'] = UpdateExternalLabelHandler

    return handlers
  }
}

ExternalLabelModeling.$inject = ['eventBus', 'elementFactory', 'commandStack', 'bpmnRules']

export default ExternalLabelModeling
