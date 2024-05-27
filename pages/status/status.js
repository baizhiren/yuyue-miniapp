const api = require('../../commom/api.js');
Page({
  data: {
    studentName: '张三',
    teacherName: '李四',
    segments: "4.24 (星期五) 10:00-13:00 4.24 (星期五) 10:00-13:00",
    studentNameError: '',
    teacherNameError: '',
  },
  check(name){
    if(name == ''){
        return ''
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
      console.log('是null')
      return ""
    }
    console.log('不是')
    return name 
  },
  getUserInfo: function(){
    api.sendRequest('user/getUserInfo')
    .then(res => {
       let info = res.data.data
       this.setData({studentName :  this.change_null_to_empty(info.uName) })
       this.setData({teacherName :  this.change_null_to_empty(info.teacherName) })
       this.setData( {studentNameError : this.check(this.data.studentName) } ),
       this.setData( {teacherNameError : this.check(this.data.teacherName) } )
    }).catch(err => {
      console.log('获取用户信息失败', err)
    })
  },


  onLoad(){
    //获取用户信息
    this.getUserInfo()
  },
  onChange(event) {
    // event.detail 为当前输入的值
    // console.log("studentName:", this.data.studentName)
    // console.log("teacherName:", this.data.teacherName)

    this.setData( {studentNameError : this.check(this.data.studentName)} ),
    this.setData( {teacherNameError : this.check(this.data.teacherName)} )
  },
});
