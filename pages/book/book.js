const api = require('../../commom/api.js');
import Notify from '../../@vant/weapp/notify/notify';

Page({
  data: {
    weeks: [
    ],
    roomNames: [
    ],
    week: '',
    roomName: '',
    segments: [],
    clicked_segments: [],
    first: true
  },

  onLoad: function(){
    //wx.removeStorageSync('yuyueSessionId');
    api.sendRequest('room/get_all_names', {})
      .then(res => {
        // 处理响应数据
        const weekdays = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        const dates = [];
        //const now = new Date();
        const now = new Date(2024, 4, 8);
        for (let i = 0; i < 7; i++) {
          // 为每一天创建一个新的日期对象
          let futureDate = new Date(now);
          futureDate.setDate(now.getDate() + i);
          // 获取月份和日期
          const month = futureDate.getMonth() + 1; // 月份是从0开始的
          const day = futureDate.getDate();
          const week = futureDate.getDay()
  
          //如果是周六或者周天，就显示下周的预约
          if(week == 6 || week == 0) continue;
          // 组合成最终的日期格式
          const formattedDate = `${month}.${day} (${weekdays[week]})`;
          dates.push({text: formattedDate, value: formattedDate});
          if(week == 5) break;
      }
      
        this.setData({week: dates[0].text }); // 设置当前星期
        this.setData({weeks: dates}); // 更新weeks数组
        
        const roomNames = res.data.data
        for (const roomName of roomNames) {
          this.data.roomNames.push({text: roomName, value: roomName});
        }
        this.setData({ roomNames: this.data.roomNames});
        this.setData({roomName: '科研楼610'})

        this.querySegments(this.map_week_to_int(this.data.week), this.data.roomName)
      })
      .catch(err => {
        console.log('错误', err)
      });
  },
  //todo 弹窗提示
  onShow: function() {
    wx.hideTabBar();
    let returnData = this.data.returnData
    if (returnData) {
      if(returnData.status == 'cancel'){
        this.setData({
          returnData: null // 清空数据以避免重复使用
        });
        return;
      }
      console.log('return data', this.data.returnData); // 使用返回的数据    
      if(returnData.status == 'success'){
          Notify({ type: 'success', message: returnData.msg, top: 70});
          console.log('预约成功')
      }else{
          Notify({ type: 'warning', message: returnData.msg, top: 70});
          console.log('预约失败')
      }
      this.setData({
        returnData: null // 清空数据以避免重复使用
      });
    }
    console.log("data.first", this.data.first)
    if(this.data.first == false){
      this.querySegments(this.map_week_to_int(this.data.week), this.data.roomName)
      this.cancelBook()
    }
    else this.data.first = false
  },
  weekchange: function({detail}){
    this.data.week = detail
    this.setData({ weeks: this.data.weeks });
    const index = this.map_week_to_int(this.data.week)
    this.querySegments(index, this.data.roomName)
    this.setData({clicked_segments: []})
  },
  map_week_to_int: function(week){
    const weekdays = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const week_split = week.split("(")[1].slice(0, -1)
    const index = weekdays.indexOf(week_split)
    return index
  },
   roomNameChange: function({detail}){
      this.data.roomName = detail
      console.log("detail:", detail)
      this.setData({ roomNames: this.data.roomNames});
      const index = this.map_week_to_int(this.data.week)
      this.querySegments(index, this.data.roomName)
      this.setData({clicked_segments: []})
   },
  querySegments: function(week, roomName){
    api.sendRequest('segment/query', {week: week, roomName: roomName})
    .then(res => {
      let segments = res.data.data.map(item => {
        item.time = item.startTime.split(" ")[1] + "-" + item.endTime.split(" ")[1]
        return item;
      })
      this.setData({segments: segments})
    }).catch(err => {
      console.log('预约查询失败', err)
    })
  },
  //todo 检查用户信息是否完整填写
  //错误提示
  confirmBook: function(){
    //查询用户信息是否
    const app = getApp()
    app.globalData.bookInfo = {date: this.data.week, roomName: this.data.roomName, segments: this.data.clicked_segments}

    wx.navigateTo({
      url: "/pages/confirmBook/confirmBook"
    });
  },
  
  findIndex: function(tid){
      for(let i = 0; i < this.data.clicked_segments.length; i ++){
          if(this.data.clicked_segments[i].tid === tid) return i; 
      }
      return -1;
  },

  handleButtonClick: function(e) {
    const posi = e.currentTarget.dataset.index
    const item = e.currentTarget.dataset.item
    if(item.click === true){
      this.data.segments[posi].click = false
      this.setData({segments: this.data.segments});
      let index = this.findIndex(item.tId); // 找到元素2的索引
      this.data.clicked_segments.splice(index, 1); // 从索引位置删除一个元素
      this.setData({clicked_segments: this.data.clicked_segments})
      return;
    }
    if (item.status == '1') { // 只处理可预约的按钮 
      this.data.segments[posi].click = true
      this.setData({segments: this.data.segments});
      this.data.clicked_segments.push({tid: item.tId, time: item.time})
      this.setData({clicked_segments: this.data.clicked_segments})
    }
    // console.log('click over segments', this.data.segments)
    // console.log('click over click', this.data.clicked_segments)
  },
  cancelBook: function(){
    this.setData({clicked_segments: []})
    const segments = this.data.segments.map(item => {
      if(item.click == true) item.click = false
      return item;
    })
    this.setData({segments})
  },




});
