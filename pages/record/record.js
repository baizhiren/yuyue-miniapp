const api = require('../../commom/api.js');
import Notify from '../../@vant/weapp/notify/notify';
Page({
  data: {
    book_infos: [],
    activeNames: ['1'],
  },
  map_int_to_week: function(week){
    const weekdays = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return weekdays[week]
  },

  get_record: function(){
    api.sendRequest('book/get_record', {}).
    then((data) => {
      let bookInfos  = data.data.data
      console.log("init book infos:", bookInfos)
      for(let bookInfo of bookInfos){
        const segments = bookInfo.segments;
        let start_time = '', end_time = ''
        let segment_info = ''
        let segment_info_2 = ''
  
        segments.sort((a, b) => {
          return a.tid - b.tid
        })
        
        const week = this.map_int_to_week(bookInfo.week)
        const date = segments[0].startTime.split(" ")[0] + " (" + week + ")" 
        let cnt = 0;
        for(var segment of segments){
          const st = segment.startTime.split(" ")[1]   
          const ed = segment.endTime.split(" ")[1]       
          if(new Date(segment.startTime) < new Date()){
              bookInfo.expire = true;
          }
          if(st != end_time){
              if(start_time != ''){
                segment_info += `${date} ${start_time.slice(0, -3)}-${end_time.slice(0, -3)}\n`
                if(cnt <= 1){
                  segment_info_2 += `${date} ${start_time.slice(0, -3)}-${end_time.slice(0, -3)}\n`
                }else{
                  segment_info_2 += `...`
                }
                cnt ++;
              }
              start_time = st  
          }
          end_time = ed
        }
        segment_info += `${date} ${start_time.slice(0, -3)}-${end_time.slice(0, -3)}`
        if(cnt <= 1)
          segment_info_2 += `${date} ${start_time.slice(0, -3)}-${end_time.slice(0, -3)}`
        else segment_info_2 += "..."
        bookInfo.segment_info = segment_info
        bookInfo.segment_info_2 = segment_info_2
      } 
      this.setData({book_infos : bookInfos})
      console.log('book infos: ', this.data.book_infos)
    }).catch((error) => {
      console.log("get record error:", error)
    })
  },


  onLoad: function(){
    this.get_record();
    console.log("in onload:", this.data.book_infos)
  },
  click_record: function(e) {
    const item = e.currentTarget.dataset.item
    const app = getApp()
    console.log("item:", item)
    app.globalData.bookRecord = item
    wx.navigateTo({
      url: "/pages/checkRecord/checkRecord"
    });
  },

  onShow: function() {
    wx.hideTabBar();
    let returnData = this.data.returnData
    console.log("record return data", returnData)
    if (returnData) {
      console.log('return data', this.data.returnData); // 使用返回的数据    
      if(returnData.status == 'success'){
          Notify({ type: 'success', message: returnData.msg, top: 70});
          console.log('取消预约成功')
      }else{
          Notify({ type: 'warning', message: returnData.msg, top: 70});
          console.log('取消预约失败')
      }
      this.setData({
        returnData: null // 清空数据以避免重复使用
      });
    }
    this.get_record();
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
});
