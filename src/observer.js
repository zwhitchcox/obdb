import { watch } from './observations'
import uuid from 'uuid/v4'

export function observer(componentClass) {

  // taken from mobx observer
  if (
    typeof componentClass === "function" &&
    (!componentClass.prototype || !componentClass.prototype.render) &&
    !componentClass.isReactClass &&
    !Component.isPrototypeOf(componentClass)
  ) {
    return observer(
      class extends Component {
        static displayName = componentClass.displayName || componentClass.name
        static contextTypes = componentClass.contextTypes
        static propTypes = componentClass.propTypes
        static defaultProps = componentClass.defaultProps
        render() {
          return componentClass.call(this, this.props, this.context)
        }
      }
    )
  }

  if (!componentClass) {
    throw new Error("Please pass a valid component to 'observer'")
  }

  const target = componentClass.prototype || componentClass

  const original_componentWillMount = componentClass.componentWillMount || (_ => {})
  const original_componentWillUnmount = componentClass.componentWillUnmount || (_ => {})
  target.componentWillMount = function () {
    componentWillMount.apply(this, arguments)
    original_componentWillMount.apply(this, arguments)
  }
  target.componentWillUnmount = function () {
    original_componentWillUnmount.apply(this, arguments)
    componentWillUnmount.apply(this, arguments)
  }
  return componentClass
}

function componentWillMount() {
  const base_render = this.render.bind(this)
  const reaction_id = uuid()
  Object.defineProperty('$obdb_reaction_id', {
    value: reaction_id,
    enumerable: false,
    configurable: false,
  })
  this.render = () => {
    return watch(base_render, this.forceUpdate.bind(this), reaction_id)
  }
}
