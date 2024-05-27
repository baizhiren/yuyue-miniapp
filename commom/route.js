// 文件路径：behaviors/commonBehavior.js
module.exports = Behavior({
  methods: {
    onRoutingChange(event) {
      const tabMap = {
        'status': '/pages/status/status',
        'book': '/pages/book/book',
        'config': '/pages/config/config',
        'record': '/pages/record/record'
      };
      const path = tabMap[event.detail];
      if (path) {
        wx.switchTab({
          url: path
        });
      }
    }
  }
});
