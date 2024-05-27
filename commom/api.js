// // 通用请求函数
// var app = getApp(); // 获取全局应用实例
// var base_url = app.globalData.baseUrl; // 正确获取baseUrl

// function sendRequest(url, data) {
//   return new Promise((resolve, reject) => {
//     // 尝试从localStorage获取sessionID
    
//     const sessionID = wx.getStorageSync('yuyueSessionId');
    
//     // 设置请求头
//     const headers = {};
//     if (sessionID) {
//       headers['yuyueSessionId'] = sessionID;
//       console.log('sessionId 存在：', sessionID)
//     }else{
//       console.log('sessionId 不存在')
//       //todo 不存在的直接发送登录请求
//     }
//     headers['Content-type'] =  'application/json'

//     console.log('发送请求', base_url + url, ' data:', data)
//     // 发送请求
//     wx.request({
//       url:  base_url + url,
//       data: data,
//       header: headers,
//       method: 'POST', // 确保使用正确的HTTP方法
//       success(res) {
//         // 如果后端返回了没有登录状态
//         console.log('request 受到结果', res)
//         if (res.data.code == '2001') {
//           console.log('未登录')
//           // 执行微信登录操作后重新发送请求
//           doWechatLogin().then(() => {
//             sendRequest(url, data).then(resolve).catch(reject);
//           }).catch((loginError) => {
//             // 处理登录失败
//             reject(loginError);
//           });
//         } else {
//           // 请求成功且用户已登录，返回结果
//           resolve(res);
//         }
//       },
//       fail(err) {
//         reject(err);
//       }
//     });
//   });
// }

// // 微信登录并获取sessionID的函数
// function doWechatLogin() {  
//   return new Promise((resolve, reject) => {
//     wx.login({
//       success(res) {
//         if (res.code) {
//           // 发送 res.code 到后台换取 openId, sessionKey, unionId
//           console.log('发送登录请求', base_url + 'user/register')
//           console.log("data=", res)
//           wx.request({
//             url: base_url + 'user/register', // 使用了base_url变量
//             data: {
//               code: res.code
//             },
//             method: 'POST', // 确保使用正确的HTTP方法
//             success(res) {
//               console.log('login, res.data=', res.data);
//               // 假设后端返回的数据包含sessionID
//               if (res.data.yuyueSessionId) {
//                 console.log('sessionId=', res.data.yuyueSessionId)
//                 // 存储sessionID到localStorage
//                 wx.setStorageSync('yuyueSessionId', res.data.yuyueSessionId);
//                 resolve(res.data); // 将后端返回的数据作为resolve的结果
//               } else {
//                 reject('登录失败，无法获取sessionID');
//               }
//             },
//             fail(err) {
//               reject('登录失败，请求后端API失败：' + err);
//             }
//           });
//         } else {
//           reject('登录失败，code生成异常' + res.errMsg);
//         }
//       },
//       fail(err) {
//         reject('wx.login 接口调用失败，可能是网络错误或者其他原因' + err);
//       }
//     });
//   });
// }

// module.exports = {
//   sendRequest,
//   doWechatLogin
// };

// 通用请求函数
/**
 * resolve 和 .then 是一一对应的关系，只有resolve解决完毕了，外边的.then 才会继续执行（异步的一个方法）
 * 
 * 
 * 
 */



var app = getApp(); // 获取全局应用实例
var base_url = app.globalData.baseUrl; // 正确获取baseUrl

function sendRequest(url, data) {
  return new Promise((resolve, reject) => {
    // 尝试从localStorage获取sessionID
    let sessionID = wx.getStorageSync('yuyueSessionId');
    
    if (!sessionID) {
      console.log('sessionId 不存在');
      // 如果 sessionID 不存在，进行登录操作
      doWechatLogin()
        .then(newSessionID => {
          console.log('登录成功，新的 sessionId：', newSessionID);
          return sendRequestWithSession(url, data, newSessionID); // 登录成功后重新发送原请求
        })
        .then(resolve)
        .catch(reject);
    } else {
      console.log('sessionId 存在：', sessionID);
      sendRequestWithSession(url, data, sessionID).then(resolve).catch(reject);
    }
  });
}

function sendRequestWithSession(url, data, sessionID) {
  return new Promise((resolve, reject) => {
    // 设置请求头
    const headers = {
      'yuyueSessionId': sessionID,
      'Content-type': 'application/json'
    };

    console.log('发送请求', base_url + url, ' data:', data);
    
    // 发送请求
    wx.request({
      url: base_url + url,
      data: data,
      header: headers,
      method: 'POST', // 确保使用正确的HTTP方法
      success(res) {
        console.log('request 收到结果', res);
        if (res.data.code == '2001') {
          console.log('未登录');
          // 执行微信登录操作后重新发送请求
          doWechatLogin().then(() => {
            sendRequest(url, data).then(resolve).catch(reject);
          }).catch((loginError) => {
            // 处理登录失败
            reject(loginError);
          });
        } else {
          // 请求成功且用户已登录，返回结果
          resolve(res);
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

// 微信登录并获取sessionID的函数
function doWechatLogin() {  
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          console.log('发送登录请求', base_url + 'user/register');
          console.log("data=", res);
          wx.request({
            url: base_url + 'user/register', // 使用了base_url变量
            data: {
              code: res.code
            },
            method: 'POST', // 确保使用正确的HTTP方法
            success(res) {
              console.log('login, res.data=', res.data);
              // 假设后端返回的数据包含sessionID
              if (res.data.yuyueSessionId) {
                console.log('sessionId=', res.data.yuyueSessionId);
                // 存储sessionID到localStorage
                wx.setStorageSync('yuyueSessionId', res.data.yuyueSessionId);
                resolve(res.data.yuyueSessionId); // 将后端返回的sessionID作为resolve的结果
              } else {
                reject('登录失败，无法获取sessionID');
              }
            },
            fail(err) {
              reject('登录失败，请求后端API失败：' + err);
            }
          });
        } else {
          reject('登录失败，code生成异常' + res.errMsg);
        }
      },
      fail(err) {
        reject('wx.login 接口调用失败，可能是网络错误或者其他原因' + err);
      }
    });
  });
}

module.exports = {
  sendRequest,
  doWechatLogin
};
