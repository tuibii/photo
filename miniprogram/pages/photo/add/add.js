// pages/photo/add/add.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{
      name:'t222t',
      time:'2019年7月10日09:07:17',
      photo:'../../../images/photo.png'
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      userInfo: {
      name: app.globalData.userInfo.nickName,
      time: new Date().toLocaleString(),
      photo: app.globalData.userInfo.avatarUrl
      }
    })
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

 
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onclick: function(){
    wx.chooseImage({
      count: 6,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        let s = res.tempFilePaths.length
        wx.showLoading({
          title: '上传中...',
        })
        Promise.all(res.tempFilePaths.map((item) => {
          return wx.cloud.uploadFile({
            cloudPath: 'uploadImages/' + Date.now() + item.match(/\.[^.]+?$/)[0], // 文件名称 
            filePath: item
          })
        }))
          .then((resCloud) => {
          
            console.log(resCloud)

            db.collection('photo').add({
              // data 字段表示需新增的 JSON 数据
              data: {
                name: app.globalData.userInfo.nickName,
                avatar:app.globalData.userInfo.avatarUrl,
                time: new Date(),
                res: resCloud
              },
              success: function (res) {
                // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                db.collection('up').add({
                  // data 字段表示需新增的 JSON 数据
                  data: {
                    photoid: res._id,
                    upid:[]
                  },
                  success: function (res) {
                    // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                    console.log(res)
                  }
                })

                console.log(res)
              }
            })

            

            wx.hideLoading()
            wx.showToast({
              title: '上传成功',
              duration: 1000
            })

            setTimeout(function(){
              wx.reLaunch({
                url: '../index/index'
              })
            },1000)

          }).catch((err) => {
            console.log(err)
          })
   
      }
    })

    
  }
})