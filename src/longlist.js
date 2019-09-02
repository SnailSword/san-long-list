/**
 * @file LongList.js 针对长列表渲染与滚动的处理
 * @author hantian(snailsword@gmail.com)
 * @author yangwei
 */

import {DataTypes, Component} from 'san';

export default class LongList extends Component{
    get template() {
        return  `
        <template>
            <div s-ref="scroller" class="{{lClass}}" style="{{wStyle}}" on-scroll="onScroll" on-wheel="onWheel">
                <div style="{{iStyle}}" class="{{iClass}}">
                    <slot s-for="i in curds" var-item="{{i}}"/>
                </div>
            </div>
        </template>`;
    }

    get dataTypes() {
        return {
            /**
            * 是否开启stopScroll (作用同stopScroll 表示在滚动到头的时候整个页面会不会跟着滚动)
            * @default false
            */
            stopScroll: DataTypes.bool,

            /**
            * 可视区域内显示的个数
            * @default 5
            */
            keeps: DataTypes.number,

            /**
            * 实际渲染的范围半径(以可视的第一个元素为中心 向前向后分别扩散多少个)
            * @default 30
            */
            radius: DataTypes.number,

            /**
            * 滚动多少项刷新一次
            * @default 4
            */
            buffer: DataTypes.number,

            /**
            * 每个item的高度
            */
            size: DataTypes.number.isRequired,

            /**
            * 组件的高度(外层容器) 如果没有设置 就以 keeps * size 作为组件的高度
            * 参数为 keeps, dl(当前的datasource.length), size
            * @default (keeps, dl, size) => (keeps * size + 'px')
            */
            lHeight: DataTypes.func,

            /**
            * 外层容器的附加样式 (onScroll那一层)
            * @default {}
            */
            lStyle: DataTypes.object,

            /**
            * 外层容器的class
            * @default []
            */
            lClass: DataTypes.array,

            /**
            * 直接包裹大量元素的容器的样式
            * @default {}
            */
            iStyle: DataTypes.object,

            /**
            * 直接包裹大量元素的容器的class
            * @default []
            */
            iClass: DataTypes.array,

            /**
            * datasource.length 启用滚动优化的阈值
            * @default 300
            */
            threshold: DataTypes.number
        };
    }

    get computed() {
        return {
            'wStyle.height'() {
                let keeps = this.data.get('keeps');
                let size = this.data.get('size');
                let dl = this.data.get('datasource').length;
                let lHeight = this.data.get('lHeight');
                if (typeof lHeight !== 'function') {
                    throw new TypeError('(from LongList)lHeight should be a function.');
                }
                return lHeight(keeps, dl, size);
            }
        };
    }

    initData() {
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
            lHeight: (keeps, dl, size) => (keeps * size + 'px'),
            enable: true
        };
    }

    inited() {
        this.watch('datasource', datasource => this.onDatasourceUpdate(datasource));
        this.watch('lStyle', lStyle => this.data.merge('wStyle', lStyle));
        let lStyle = this.data.get('lStyle');
        lStyle && this.data.merge('wStyle', lStyle);
    }

    attached() {
        this._repaintChildren();
        let {threshold, buffer, datasource} = this.data.get();
        if (!threshold) {
            this.data.set('threshold', 2 * buffer + 1);
        }
        this.onDatasourceUpdate(datasource);
    }

    onScroll(e) {
        if (!this.data.get('enable')) {
            return;
        }
        let scrollTop = e.target.scrollTop;
        let {size, buffer} = this.data.get();
        let c = this.data.get('cache') || 0;

        // 滚动位置与上一次的间距在buffer范围内 就不做处理
        if (Math.abs(c - scrollTop) <= buffer * size) {
            return;
        }
        let tt = scrollTop % size;
        let start = Math.floor(scrollTop / size);
        this.data.set('cache', scrollTop);
        this.update(start, tt);
    }

    /**
     * @param {number} start 可视范围内第一个item的index
     * @param {number} tt scrollTop % size 为了防止滚动时跳动
     *                    需要处理一下触发onScroll时截到一般位置的情况
     */
    update(start, tt = 0) {
        let {datasource, radius, keeps, size} = this.data.get();
        keeps = typeof keeps === 'number' ? keeps : 0;
        let curds = [];
        for (let i = start - radius; i < start + radius + keeps; i++) {
            if (i < 0 || i >= datasource.length) {
                continue;
            }
            curds.push(datasource[i]);
        }
        this.data.set('curds', curds);

        // 计算如果所有item都渲染出来 第一个item的顶端到可视区域的顶端的距离
        let pt = (start - (radius + 1)) * size + tt;

        // 用 padding-top 和 padding-bottom占位
        // radius * 2 - keeps 是所有渲染出来了的item的高度
        let iStyle = {
            'padding-top': pt + 'px',
            'padding-bottom': (datasource.length * size - pt - (radius * 2 + keeps) * size) + 'px'
        };
        this.data.merge('iStyle', iStyle);
    }

    onDatasourceUpdate(datasource) {
        // 如果datasource变化了 需要滚回顶端
        this.ref('scroller').scrollTop = 0;

        let threshold = this.data.get('threshold');

        // datasource.length 在阈值范围内 就不做优化处理
        if (datasource.length <= threshold) {
            this.data.set('curds', datasource);
            this.data.merge('iStyle', {
                'padding-top': 0,
                'padding-bottom': 0
            });

            // 表示是否需要启用优化
            this.data.set('enable', false);
        }
        else {
            this.data.set('enable', true);
            this.update(0, 0);
        }
    }

    /**
     * copy from StopScroll
     *
     * @author leeight
     */
    onWheel(e) {
        const enabled = this.data.get('stopScroll');
        if (!enabled) {
            return;
        }

        const layer = e.currentTarget;
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
}

