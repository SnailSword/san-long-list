"use strict";

var MyApp = san.defineComponent({
  template: "<template>\n        <div class=\"container\">\n            <div class=\"header\">\n                keeps = 10 , size = 30\n            </div>\n            <long-list keeps=\"{{10}}\" datasource=\"{{list}}\" size=\"{{30}}\">\n                <div class=\"item\">\n                    {{item}}\n                </div>\n            </long-list>\n        </div>\n    </template>",
  components: {
    'long-list': LongList
  },
  initData: function initData() {
    return {
      amount: 100000
    };
  },
  inited: function inited() {
    var list = [];

    var _this$data$get = this.data.get(),
        amount = _this$data$get.amount;

    for (var i = 1; i <= amount; i++) {
      list.push("I'm item No.".concat(i));
    }

    this.data.set('list', list);
  }
});
var myApp = new MyApp();
myApp.attach(document.body);