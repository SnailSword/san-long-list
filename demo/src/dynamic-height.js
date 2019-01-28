let MyApp = san.defineComponent({
    template: `<template>
        <div class="container">
            <div class="header">
                输入筛选：
                <input class="filter" type="text" value="{=value=}">
            </div>
            <long-list keeps="{{10}}" lHeight="{{lHeight}}" datasource="{{filterList}}" size="{{30}}">
                <div class="item">
                    {{item}}
                </div>
            </long-list>
            <div class="footer">↑ 我是底 ↑</div>
        </div>
    </template>`,

    components: {
        'long-list': LongList
    },

    initData() {
        return {
            amount: 100000,
            lHeight: (keeps, dl, size) => (Math.min(keeps, dl) * size + 'px')
        };
    },

    inited() {
        let list = [];
        let {amount} = this.data.get();
        for (let i = 1; i <= amount; i++) {
            list.push(`I'm item No.${i}`);
        }
        this.data.set('list', list);
    },
    
    computed: {
        filterList() {
            let list = this.data.get('list');
            let filter = this.data.get('value');
            if (!filter) {
                return list;
            }
            return list.filter(item => ~item.indexOf(filter));
        }
    }
});

let myApp = new MyApp();
myApp.attach(document.body);
