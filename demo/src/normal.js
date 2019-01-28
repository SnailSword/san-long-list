let MyApp = san.defineComponent({
    template: `<template>
        <div class="container">
            <div class="header">
                keeps = 10 , size = 30
            </div>
            <long-list keeps="{{10}}" datasource="{{list}}" size="{{30}}">
                <div class="item">
                    {{item}}
                </div>
            </long-list>
        </div>
    </template>`,

    components: {
        'long-list': LongList
    },

    initData: function () {
        return {
            amount: 100000
        };
    },

    inited() {
        let list = [];
        let {amount} = this.data.get();
        for (let i = 1; i <= amount; i++) {
            list.push(`I'm item No.${i}`);
        }
        this.data.set('list', list);
    }
});

let myApp = new MyApp();
myApp.attach(document.body);
