(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('san')) :
    typeof define === 'function' && define.amd ? define(['san'], factory) :
    (global.LongList = factory(global.san));
}(this, (function (san) { 'use strict';

    /**
     * @file LongList.js 针对长列表渲染与滚动的处理
     * @author hantian(snailsword@gmail.com)
     * @author yangwei
     */

    var longlist = san.defineComponent({
        template: '\n        <template>\n            <div s-ref="scroller" class="{{lClass}}" style="{{wStyle}}" on-scroll="onScroll" on-wheel="onWheel">\n                <div style="{{iStyle}}" class="{{iClass}}">\n                    <slot s-for="i in curds" var-item="{{i}}"/>\n                </div>\n            </div>\n        </template>',
        onScroll: function onScroll(e) {
            if (!this.data.get('enable')) {
                return;
            }
            var scrollTop = e.target.scrollTop;

            var _data$get = this.data.get(),
                size = _data$get.size,
                buffer = _data$get.buffer;

            var c = this.data.get('cache') || 0;

            // 滚动位置与上一次的间距在buffer范围内 就不做处理
            if (Math.abs(c - scrollTop) <= buffer * size) {
                return;
            }
            var tt = scrollTop % size;
            var start = Math.floor(scrollTop / size);
            this.data.set('cache', scrollTop);
            this.update(start, tt);
        },


        /**
         * @param {number} start 可视范围内第一个item的index
         * @param {number} tt scrollTop % size 为了防止滚动时跳动
         *                    需要处理一下触发onScroll时截到一般位置的情况
         */
        update: function update(start) {
            var tt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var _data$get2 = this.data.get(),
                datasource = _data$get2.datasource,
                radius = _data$get2.radius,
                keeps = _data$get2.keeps,
                size = _data$get2.size;

            keeps = typeof keeps === 'number' ? keeps : 0;
            var curds = [];
            for (var i = start - radius; i < start + radius - keeps; i++) {
                if (i < 0 || i >= datasource.length) {
                    continue;
                }
                curds.push(datasource[i]);
            }
            this.data.set('curds', curds);

            // 计算如果所有item都渲染出来 第一个item的顶端到可视区域的顶端的距离
            var pt = (start - (radius + 1)) * size + tt;

            // 用 padding-top 和 padding-bottom占位
            // radius * 2 - keeps 是所有渲染出来了的item的高度
            var iStyle = {
                'padding-top': pt + 'px',
                'padding-bottom': datasource.length * size - pt - (radius * 2 - keeps) * size + 'px'
            };
            this.data.merge('iStyle', iStyle);
        },
        inited: function inited() {
            var _this = this;

            this.watch('datasource', function (datasource) {
                return _this.onDatasourceUpdate(datasource);
            });
            this.watch('lStyle', function (lStyle) {
                return _this.data.merge('wStyle', lStyle);
            });
            var lStyle = this.data.get('lStyle');
            this.data.merge('wStyle', lStyle);
        },
        onDatasourceUpdate: function onDatasourceUpdate(datasource) {
            // 如果datasource变化了 需要滚回顶端
            this.ref('scroller').scrollTop = 0;

            var threshold = this.data.get('threshold');

            // datasource.length 在阈值范围内 就不做优化处理
            if (datasource.length <= threshold) {
                this.data.set('curds', datasource);
                this.data.merge('iStyle', {
                    'padding-top': 0,
                    'padding-bottom': 0
                });

                // 表示是否需要启用优化
                this.data.set('enable', false);
            } else {
                this.data.set('enable', true);
                this.update(0, 0);
            }
        },
        initData: function initData() {
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
                    return '300px';
                },
                enable: true
            };
        },

        dataTypes: {
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
             * @default (keeps, dl, size) => '300px'
             */
            lHeight: san.DataTypes.objectOf(san.DataTypes.function),

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
        },
        attached: function attached() {
            var _data$get3 = this.data.get(),
                threshold = _data$get3.threshold,
                buffer = _data$get3.buffer,
                datasource = _data$get3.datasource;

            if (!threshold) {
                this.data.set('threshold', 2 * buffer + 1);
            }
            this.onDatasourceUpdate(datasource);
        },


        /**
         * copy from StopScroll
         *
         * @author leeight
         */
        onWheel: function onWheel(e) {
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
        },

        computed: {
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
        }
    });

    return longlist;

})));
