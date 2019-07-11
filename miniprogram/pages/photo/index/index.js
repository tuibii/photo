// pages/photo/index/index.js
const db = wx.cloud.database()
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    upInfo:[],
    openid:'',
    albumList:[
      {
        headPhoto: '../../../images/photo.png',
        name: 'tt1',
        time: '2019年7月9日17:15:06',
        photo: [
          '../../../images/1.png',
          '../../../images/1.png',
          '../../../images/1.png',
          '../../../images/1.png'
        ]
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    this.setData({
      openid: app.globalData.openId
    })
    
     db.collection('photo').get({
      success: res => {
        this.setData({
          albumList: res.data
        })
        console.log('[数据库] [查询记录]信息 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录]信息 失败：', err)
      }
    })

    db.collection('up').get({
      success: res => {
        this.setData({
          upInfo: res.data
        })
        console.log('[数据库] [查询记录]点赞 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录]点赞 失败：', err)
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
  addPhoto: function(){
    wx.navigateTo({
      url: '../add/add'
    })
  },
  delPhoto: function (e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认要删除吗',
      success(res) {
        if (res.confirm) {
          let index = e.currentTarget.dataset.id
          wx.cloud.deleteFile({
            fileList: that.data.albumList[index].res.map(item => (item.fileID))
          }).then(res => {
            // handle success
            console.log(res.fileList)
          }).catch(error => {
            // handle error
          })
          db.collection('photo').doc(that.data.albumList[index]._id).remove()
            .then(console.log)
            .catch(console.error)

          db.collection('up').doc(that.data.upInfo[index]._id).remove()
            .then(console.log)
            .catch(console.error)


          that.data.albumList.splice(index, 1)
          that.data.upInfo.splice(index, 1)
          that.setData({
            albumList: that.data.albumList,
            upInfo: that.data.upInfo
          })

          wx.showToast({
            title: '删除成功',
            duration: 1000
          })
        } else if (res.cancel) {
        
        }
      }

    })
  },
  upup: function(e){
    let index = e.currentTarget.dataset.id
    console.log(index)
  }
})