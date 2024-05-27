const api = require('../../commom/api.js');
Page({
  data: {
    studentName: '',
    teacherName: '',
    segments: "",
    studentNameError: '',
    teacherNameError: '',
    bookInfo: {},
    roomName: '',
    week: '',
    tids: [],
    readOnly : true
  },
  check(name){
    if(name == ''){
        return '姓名不能为空哦'
    }
    if (!/^[\u4e00-\u9fa5]+$/.test(name)) {
      return '姓名必须全为汉字哦';
    }
  // 校验是否至少包含两个汉字
    if (name.length < 2) {
        return '姓名长度过少';
    }
    // 校验是否不超过10个汉字
    if (name.length > 10) {
        return '姓名长度过长';
    }
    // 如果通过了以上所有校验，则返回 true
    return '';  
  },
  change_null_to_empty: function (name) {
    let None = null
    if(name == None) {
      return ""
    }
    return name 
  },
  getUserInfo: function(){
    api.sendRequest('user/getUserInfo')
    .then(res => {
       let info = res.data.data
       console.log("info:", info)
       if(info.uName == null || info.teacherName == null) {
         this.setData({readOnly: false})
       }
       console.log("read only:", this.data.readOnly)
       this.setData({studentName :  this.change_null_to_empty(info.uName) })
       this.setData({teacherName :  this.change_null_to_empty(info.teacherName) })
       this.setData( {studentNameError : this.check(this.data.studentName) } ),
       this.setData( {teacherNameError : this.check(this.data.teacherName) } )
    }).catch(err => {
      console.log('获取用户信息失败', err)
    })
  },

  map_week_to_int: function(week){
    console.log("week:", week)
    const weekdays = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const week_split = week.split("(")[1].slice(0, -1)
    const index = weekdays.indexOf(week_split)
    return index
  },


  onLoad(){
    //获取用户信息
    console.log('this is comfirm book page')
    this.getUserInfo()
    
    const bookInfo = getApp().globalData.bookInfo
    this.data.bookInfo = bookInfo 

 
    //app.globalData.bookInfo = {date: this.data.week, roomName: this.data.roomName, tIds: this.data.clicked_segments}
    this.setData({roomName: bookInfo.roomName})
    //预约时段, 把连续的合并
    const segments = bookInfo.segments;
    const date = bookInfo.date
    let start_time = '', end_time = ''
    let segment_info = ''

    this.data.week = this.map_week_to_int(date)
  
    segments.sort((a, b) => {
      return a.tid - b.tid
    })

    for(var segment of segments){
      const t = segment.time.split("-")
      const st = t[0], ed = t[1]
      
      this.data.tids.push(segment.tid)

      
      if(st != end_time){
          if(start_time != '')
            segment_info += `${date} ${start_time.slice(0, -3)}-${end_time.slice(0, -3)}\n`
          start_time = st  
      }
      end_time = ed
    }
    segment_info += `${date} ${start_time.slice(0, -3)}-${end_time.slice(0, -3)}`
    this.setData( {segments : segment_info})

  },
  onChange(event) {
    // event.detail 为当前输入的值
    // console.log("studentName:", this.data.studentName)
    // console.log("teacherName:", this.data.teacherName)

    this.setData( {studentNameError : this.check(this.data.studentName)} ),
    this.setData( {teacherNameError : this.check(this.data.teacherName)} )
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
    // console.log("s error", studentNameError, "t error", this.data.teacherName)
    if(this.data.studentNameError != '' && this.data.teacherNameError != '') return;
    console.log('预约中...')
    api.sendRequest('segment/appointment', {week: this.data.week, roomName: this.data.roomName, tIds: this.data.tids, studentName: this.data.studentName, teacherName: this.data.teacherName})
    .then(res => {
        const data = res.data
        if(data.code == 2000){
          console.log('预约成功', data)
          this.sendMessage({status : "success", msg: "预约成功"})
        }else{
          this.sendMessage({status : "fail", msg: data.msg})
          console.log('预约失败', data)
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
  }, 
  cancel(){
    this.sendMessage({status : "cancel", msg: "返回"})
    wx.navigateBack({
      delta: 1  // 返回的页面数，默认为1，表示返回上一页面
    });
  }
});
