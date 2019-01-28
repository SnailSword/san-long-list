(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('san')) :
  typeof define === 'function' && define.amd ? define(['san'], factory) :
  (global = global || self, global.LongList = factory(global.san));
}(this, function (san) { 'use strict';

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

  var LongList =
  /*#__PURE__*/
  function (_Component) {
    _inherits(LongList, _Component);

    function LongList() {
      _classCallCheck(this, LongList);

      return _possibleConstructorReturn(this, _getPrototypeOf(LongList).apply(this, arguments));
    }

    _createClass(LongList, [{
      key: "initData",
      value: function initData() {
        return {
          datasource: [],
          curds: [],
          keeps: 5,
          radius: 30,
          buffer: 4,
          wStyle: {
            'overflow-y': 'scroll'
          },
          fixHeight: null,
          stopScroll: true,
          iStyle: {},
          threshold: 300,
          lHeight: function lHeight(keeps, dl, size) {
            return keeps * size + 'px';
          },
          enable: true
        };
      }
    }, {
      key: "inited",
      value: function inited() {
        var _this = this;

        this.watch('datasource', function (datasource) {
          return _this.onDatasourceUpdate(datasource);
        });
        this.watch('lStyle', function (lStyle) {
          return _this.data.merge('wStyle', lStyle);
        });
        var lStyle = this.data.get('lStyle');
        lStyle && this.data.merge('wStyle', lStyle);
      }
    }, {
      key: "attached",
      value: function attached() {
        this._repaintChildren();

        var _this$data$get = this.data.get(),
            threshold = _this$data$get.threshold,
            buffer = _this$data$get.buffer,
            datasource = _this$data$get.datasource;

        if (!threshold) {
          this.data.set('threshold', 2 * buffer + 1);
        }

        this.onDatasourceUpdate(datasource);
      }
    }, {
      key: "onScroll",
      value: function onScroll(e) {
        if (!this.data.get('enable')) {
          return;
        }

        var scrollTop = e.target.scrollTop;

        var _this$data$get2 = this.data.get(),
            size = _this$data$get2.size,
            buffer = _this$data$get2.buffer;

        var c = this.data.get('cache') || 0; // 滚动位置与上一次的间距在buffer范围内 就不做处理

        if (Math.abs(c - scrollTop) <= buffer * size) {
          return;
        }

        var tt = scrollTop % size;
        var start = Math.floor(scrollTop / size);
        this.data.set('cache', scrollTop);
        this.update(start, tt);
      }
      /**
       * @param {number} start 可视范围内第一个item的index
       * @param {number} tt scrollTop % size 为了防止滚动时跳动
       *                    需要处理一下触发onScroll时截到一般位置的情况
       */

    }, {
      key: "update",
      value: function update(start) {
        var tt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var _this$data$get3 = this.data.get(),
            datasource = _this$data$get3.datasource,
            radius = _this$data$get3.radius,
            keeps = _this$data$get3.keeps,
            size = _this$data$get3.size;

        keeps = typeof keeps === 'number' ? keeps : 0;
        var curds = [];

        for (var i = start - radius; i < start + radius - keeps; i++) {
          if (i < 0 || i >= datasource.length) {
            continue;
          }

          curds.push(datasource[i]);
        }

        this.data.set('curds', curds); // 计算如果所有item都渲染出来 第一个item的顶端到可视区域的顶端的距离

        var pt = (start - (radius + 1)) * size + tt; // 用 padding-top 和 padding-bottom占位
        // radius * 2 - keeps 是所有渲染出来了的item的高度

        var iStyle = {
          'padding-top': pt + 'px',
          'padding-bottom': datasource.length * size - pt - (radius * 2 - keeps) * size + 'px'
        };
        this.data.merge('iStyle', iStyle);
      }
    }, {
      key: "onDatasourceUpdate",
      value: function onDatasourceUpdate(datasource) {
        // 如果datasource变化了 需要滚回顶端
        this.ref('scroller').scrollTop = 0;
        var threshold = this.data.get('threshold'); // datasource.length 在阈值范围内 就不做优化处理

        if (datasource.length <= threshold) {
          this.data.set('curds', datasource);
          this.data.merge('iStyle', {
            'padding-top': 0,
            'padding-bottom': 0
          }); // 表示是否需要启用优化

          this.data.set('enable', false);
        } else {
          this.data.set('enable', true);
          this.update(0, 0);
        }
      }
      /**
       * copy from StopScroll
       *
       * @author leeight
       */

    }, {
      key: "onWheel",
      value: function onWheel(e) {
        var enabled = this.data.get('stopScroll');

        if (!enabled) {
          return;
        }

        var layer = e.currentTarget;

        if (!layer) {
          return;
        }

        if (layer.scrollTop + e.deltaY + layer.clientHeight >= layer.scrollHeight) {
          e.preventDefault();
          layer.scrollTop = layer.scrollHeight;
        }

        if (layer.scrollTop + e.deltaY <= 0) {
          e.preventDefault();
          layer.scrollTop = 0;
        }
      }
    }, {
      key: "template",
      get: function get() {
        return "\n        <template>\n            <div s-ref=\"scroller\" class=\"{{lClass}}\" style=\"{{wStyle}}\" on-scroll=\"onScroll\" on-wheel=\"onWheel\">\n                <div style=\"{{iStyle}}\" class=\"{{iClass}}\">\n                    <slot s-for=\"i in curds\" var-item=\"{{i}}\"/>\n                </div>\n            </div>\n        </template>";
      }
    }, {
      key: "dataTypes",
      get: function get() {
        return {
          /**
          * 是否开启stopScroll (作用同stopScroll 表示在滚动到头的时候整个页面会不会跟着滚动)
          * @default false
          */
          stopScroll: san.DataTypes.bool,

          /**
          * 可视区域内显示的个数
          * @default 5
          */
          keeps: san.DataTypes.number,

          /**
          * 实际渲染的范围半径(以可视的第一个元素为中心 向前向后分别扩散多少个)
          * @default 30
          */
          radius: san.DataTypes.number,

          /**
          * 滚动多少项刷新一次
          * @default 4
          */
          buffer: san.DataTypes.number,

          /**
          * 每个item的高度
          */
          size: san.DataTypes.number.isRequired,

          /**
          * 组件的高度(外层容器) 如果没有设置 就以 keeps * size 作为组件的高度
          * 参数为 keeps, dl(当前的datasource.length), size
          * @default (keeps, dl, size) => (keeps * size + 'px')
          */
          lHeight: san.DataTypes.func,

          /**
          * 外层容器的附加样式 (onScroll那一层)
          * @default {}
          */
          lStyle: san.DataTypes.object,

          /**
          * 外层容器的class
          * @default []
          */
          lClass: san.DataTypes.array,

          /**
          * 直接包裹大量元素的容器的样式
          * @default {}
          */
          iStyle: san.DataTypes.object,

          /**
          * 直接包裹大量元素的容器的class
          * @default []
          */
          iClass: san.DataTypes.array,

          /**
          * datasource.length 启用滚动优化的阈值
          * @default 300
          */
          threshold: san.DataTypes.number
        };
      }
    }, {
      key: "computed",
      get: function get() {
        return {
          'wStyle.height': function wStyleHeight() {
            var keeps = this.data.get('keeps');
            var size = this.data.get('size');
            var dl = this.data.get('datasource').length;
            var lHeight = this.data.get('lHeight');

            if (typeof lHeight !== 'function') {
              throw new TypeError('(from LongList)lHeight should be a function.');
            }

            return lHeight(keeps, dl, size);
          }
        };
      }
    }]);

    return LongList;
  }(san.Component);

  return LongList;

}));
