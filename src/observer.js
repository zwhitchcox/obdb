import { watch } from './observations'

export function observer(componentClass) {

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
  target.componentWillMount = function () {
    componentWillMount.apply(this, arguments)
    original_componentWillMount.apply(this, arguments)
  }
  return componentClass
}

function componentWillMount() {
  const baseRender = this.render.bind(this)
  this.render = () => {
    const rendering = watch(baseRender, (...args) => console.log('updating') || this.forceUpdate.bind(this)(...args))
    return rendering
  }
}
