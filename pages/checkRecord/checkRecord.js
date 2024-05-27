const api = require('../../commom/api.js');
Page({
  data: {
    segments: "",
    record: {},
    roomName: '',
    bookTime: '',
    expire: false
  },
  onLoad(){
    //获取用户信息
    console.log('this is book record page')
  
    const record = getApp().globalData.bookRecord
    this.data.record = record 
    this.setData({roomName: record.roomName})
    this.setData({segments : record.segment_info})
    this.setData({bookTime: record.bookTime})
    this.setData({expire: record.expire})
  },
  sendMessage(returnData){
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2]; // 获取上一个页面实例
    if (prevPage) {
      prevPage.setData({
        returnData: returnData// 设置要传递的数据
      });
    }
  },

  confirm() {
    wx.navigateBack({
      delta: 1  // 返回的页面数，默认为1，表示返回上一页面
    });
  }, 
  cancel(){
    console.log('取消预约中...')
    const record = this.data.record;
    api.sendRequest('book/cancel_book', {bookId: record.bookId, roomName: record.roomName, week: record.week})
    .then(res => {
        const data = res.data
        if(data.code == 2000){
          console.log('取消预约成功', data)
          this.sendMessage({status : "success", msg: "取消预约成功"})
        }else{
          this.sendMessage({status : "fail", msg: data.msg})
          console.log('取消预约失败', data)
        }
    }).catch(err => {
      const message = err && err.message ? err.message : "未知错误，请稍后再试";
      this.sendMessage({
          status: "fail",
          msg: message
      });
    }).finally(() => { 
      wx.navigateBack({
        delta: 1  // 返回的页面数，默认为1，表示返回上一页面
      });
    })
  }
});
