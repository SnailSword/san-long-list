"use strict";

var MyApp = san.defineComponent({
  template: "<template>\n        <div class=\"container\">\n            <div class=\"header\">\n                \u8F93\u5165\u7B5B\u9009\uFF1A\n                <input class=\"filter\" type=\"text\" value=\"{=value=}\">\n            </div>\n            <long-list keeps=\"{{10}}\" lHeight=\"{{lHeight}}\" datasource=\"{{filterList}}\" size=\"{{30}}\">\n                <div class=\"item\">\n                    {{item}}\n                </div>\n            </long-list>\n            <div class=\"footer\">\u2191 \u6211\u662F\u5E95 \u2191</div>\n        </div>\n    </template>",
  components: {
    'long-list': LongList
  },
  initData: function initData() {
    return {
      amount: 100000,
      lHeight: function lHeight(keeps, dl, size) {
        return Math.min(keeps, dl) * size + 'px';
      }
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
  },
  computed: {
    filterList: function filterList() {
      var list = this.data.get('list');
      var filter = this.data.get('value');

      if (!filter) {
        return list;
      }

      return list.filter(function (item) {
        return ~item.indexOf(filter);
      });
    }
  }
});
var myApp = new MyApp();
myApp.attach(document.body);