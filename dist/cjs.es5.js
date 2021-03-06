'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var observerUtil = require('@nx-js/observer-util');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var isInsideFunctionComponent = false;
var COMPONENT = Symbol("owner component");
function view(Comp) {
  var isStatelessComp = !(Comp.prototype && Comp.prototype.isReactComponent);
  var ReactiveComp;

  if (isStatelessComp) {
    // use a hook based reactive wrapper when we can
    ReactiveComp = react.memo(function (props) {
      // use a dummy setState to update the component
      var _useState = react.useState(),
          _useState2 = _slicedToArray(_useState, 2),
          setState = _useState2[1]; // create a memoized reactive wrapper of the original component (render)
      // at the very first run of the component function


      var render = react.useMemo(function () {
        return observerUtil.observe(Comp, {
          scheduler: function scheduler() {
            return setState({});
          },
          //The scheduler simply calls setState on relevant observable changes. This delegates the render scheduling to React Fiber
          lazy: true // A boolean, which controls if the reaction is executed when it is created or not. If it is true, the reaction has to be called once manually to trigger the reactivity process.

        });
      }, // Adding the original Comp here is necessary to make React Hot Reload work
      // it does not affect behavior otherwise
      [Comp]); // cleanup the reactive connections after the very last render of the component

      react.useEffect(function () {
        return function () {
          return observerUtil.unobserve(render);
        };
      }, []); // the isInsideFunctionComponent flag is used to toggle `store` behavior
      // based on where it was called from

      isInsideFunctionComponent = true;

      try {
        // run the reactive render instead of the original one
        return render(props);
      } finally {
        isInsideFunctionComponent = false;
      }
    });
  } else {
    var BaseComp = isStatelessComp ? react.Component : Comp; // a HOC which overwrites render, shouldComponentUpdate and componentWillUnmount
    // it decides when to run the new reactive methods and when to proxy to the original methods

    var ReactiveClassComp =
    /*#__PURE__*/
    function (_BaseComp) {
      _inherits(ReactiveClassComp, _BaseComp);

      function ReactiveClassComp(props, context) {
        var _this;

        _classCallCheck(this, ReactiveClassComp);

        _this = _possibleConstructorReturn(this, _getPrototypeOf(ReactiveClassComp).call(this, props, context));
        _this.state = _this.state || {};
        _this.state[COMPONENT] = _assertThisInitialized(_this); // create a reactive render for the component

        _this.render = observerUtil.observe(_this.render, {
          scheduler: function scheduler() {
            return _this.setState({});
          },
          //The scheduler simply calls setState on relevant observable changes. This delegates the render scheduling to React Fiber
          lazy: true // A boolean, which controls if the reaction is executed when it is created or not. If it is true, the reaction has to be called once manually to trigger the reactivity process.

        });
        return _this;
      }

      _createClass(ReactiveClassComp, [{
        key: "render",
        value: function render() {
          return isStatelessComp ? Comp(this.props, this.context) : _get(_getPrototypeOf(ReactiveClassComp.prototype), "render", this).call(this);
        } // react should trigger updates on prop changes, while easyState handles store changes

      }, {
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
          var props = this.props,
              state = this.state; // respect the case when the user defines a shouldComponentUpdate

          if (_get(_getPrototypeOf(ReactiveClassComp.prototype), "shouldComponentUpdate", this)) {
            return _get(_getPrototypeOf(ReactiveClassComp.prototype), "shouldComponentUpdate", this).call(this, nextProps, nextState);
          } // return true if it is a reactive render or state changes


          if (state !== nextState) {
            return true;
          } // the component should update if any of its props shallowly changed value


          var keys = Object.keys(props);
          var nextKeys = Object.keys(nextProps);
          return nextKeys.length !== keys.length || nextKeys.some(function (key) {
            return props[key] !== nextProps[key];
          });
        } // add a custom deriveStoresFromProps lifecyle method

      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          // call user defined componentWillUnmount
          if (_get(_getPrototypeOf(ReactiveClassComp.prototype), "componentWillUnmount", this)) {
            _get(_getPrototypeOf(ReactiveClassComp.prototype), "componentWillUnmount", this).call(this);
          } // clean up memory used by Easy State


          observerUtil.unobserve(this.render);
        }
      }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(props, state) {
          if (_get(_getPrototypeOf(ReactiveClassComp), "deriveStoresFromProps", this)) {
            var _get2;

            // inject all local stores and let the user mutate them directly
            var stores = mapStateToStores(state);

            (_get2 = _get(_getPrototypeOf(ReactiveClassComp), "deriveStoresFromProps", this)).call.apply(_get2, [this, props].concat(_toConsumableArray(stores)));
          } // respect user defined getDerivedStateFromProps


          if (_get(_getPrototypeOf(ReactiveClassComp), "getDerivedStateFromProps", this)) {
            return _get(_getPrototypeOf(ReactiveClassComp), "getDerivedStateFromProps", this).call(this, props, state);
          }

          return null;
        }
      }]);

      return ReactiveClassComp;
    }(BaseComp);

    ReactiveComp = ReactiveClassComp;
  }

  ReactiveComp.displayName = Comp.displayName || Comp.name; // static props are inherited by class components,
  // but have to be copied for function components

  if (isStatelessComp) {
    for (var _i = 0, _Object$keys = Object.keys(Comp); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];
      ReactiveComp[key] = Comp[key];
    }
  }

  return ReactiveComp;
}

function mapStateToStores(state) {
  // find store properties and map them to their none observable raw value
  // to do not trigger none static this.setState calls
  // from the static getDerivedStateFromProps lifecycle method
  var component = state[COMPONENT];
  return Object.keys(component).map(function (key) {
    return component[key];
  }).filter(observerUtil.isObservable).map(observerUtil.raw);
}

var hasHooks = typeof react.useState === "function";

function store(obj) {
  // do not create new versions of the store on every render
  // if it is a local store in a function component
  // create a memoized store at the first call instead
  if (hasHooks && isInsideFunctionComponent) {
    return react.useMemo(function () {
      return observerUtil.observable(obj);
    }, []);
  }

  return observerUtil.observable(obj);
}

exports.store = store;
exports.view = view;
//# sourceMappingURL=cjs.es5.js.map
