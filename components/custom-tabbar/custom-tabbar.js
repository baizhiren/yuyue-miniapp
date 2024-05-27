Component({
  properties: {
    // 初始活动标签项，从外部传入
    active: {
      type: String,
      value: 'status'
    }
  },
  data: {
    // 你可以在这里定义组件内部使用的其他数据
  },
  methods: {
    onChange(event) {
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
      const activeName = event.detail;
      console.log('路由变化', activeName);
      // 设置内部 active 状态以响应标签变化
      // // 如果需要，也可以将改变的事件传递给组件的使用者
      // this.triggerEvent('change', activeName);
    }
  }
});
