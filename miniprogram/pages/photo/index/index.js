// pages/photo/index/index.js
const db = wx.cloud.database()
const app = getApp()
const _ = db.command

Page({
  /**
   * 页面的初始数据
   */
  data: {
    formValue:'',
    placeholder:'',
    commentphotoid:'',
    talkid1:'',
    talkid2:'',
    focusInput: false,
    height: '',
    isInput: false,
    upItem:[],
    upInfo:{},
    openid:'',
    albumList:[],
    chats:[]
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    this.setData({
      openid: app.globalData.openId
    })
    // console.log(options)
    if(options.id != undefined){
      wx.showToast({
        title: '来自好友： '+options.name+' 的分享',
        icon: 'none',
        duration: 3000
      })
      console.log(options)
      db.collection('photo').where({
        _id: options.id
      }).get({
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

      db.collection('up').where({
        photoid: options.id
      }).get({
        success: res => {
          for (var item of res.data) {
            let upSet = new Set(item.upid)
            item.upid = Array.from(upSet)

            if (upSet.has(this.data.openid)) {
              this.data.upItem.push(true)
            } else {
              this.data.upItem.push(false)
            }
          }

          console.log(res.data)
          this.setData({
            upInfo: Array.from(res.data),
            upItem: this.data.upItem
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
      
    }else{
    
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
        for(var item of res.data){
          let upSet = new Set(item.upid)
          item.upid = Array.from(upSet)

          if (upSet.has(this.data.openid)){
            this.data.upItem.push(true)
          }else{
            this.data.upItem.push(false)
          }
        }

        console.log(res.data)
        this.setData({
          upInfo: Array.from(res.data),
          upItem: this.data.upItem
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
    }

    // 评论
    db.collection('comment').get({
      success: res => {
        this.setData({
          chats: res.data
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
    let that = this
    wx.showNavigationBarLoading()
    let options = {}
    setTimeout(function(){
      that.onLoad(options)
      wx.hideNavigationBarLoading()
      // 停止下拉动作
      wx.stopPullDownRefresh()
      wx.showToast({
        icon:'success',
        title: '刷新成功',
      })
    },1500)
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
    let that = this
    wx.showModal({
      title: '提示',
      content: '确认要删除吗',
      success(res) {
        if (res.confirm) {
          let index = e.currentTarget.dataset.id
          let delComment = that.data.albumList[index]._id
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
          for(var i = 0;i<that.data.chats.length;i++){
            if (that.data.chats[i].photoid == delComment){
              console.log('删除了评论', delComment, that.data.chats)
              db.collection('comment').doc(that.data.chats[i]._id).remove()
                .then(console.log)
                .catch(console.error)
                
              break;
            }
          }
          wx.showLoading({
            title: '删除中...',
          },1000)
          that.data.upItem.splice(index, 1)
          that.data.albumList.splice(index, 1)
          that.data.upInfo.splice(index, 1)

          setTimeout(function(){
            that.setData({
              albumList: that.data.albumList,
              upInfo: that.data.upInfo,
              upItem: that.data.upItem
            })

            wx.hideLoading()
            wx.showToast({
              title: '删除成功',
              duration: 1000
            })
          },1000)
          
          
        } else if (res.cancel) {
        
        }
      }

    })
  },
  upup: function(e){
    let index = e.currentTarget.dataset.id
    console.log(index)
    let upSet = new Set(this.data.upInfo[index].upid)
    if (upSet.has(this.data.openid)){
      upSet.delete(this.data.openid)

      wx.cloud.callFunction({
        name: 'updatedb',
        data: {
          dbname: 'up',
          docid: this.data.upInfo[index]._id,
          dbdata: {
            upid: Array.from(upSet)
          }
        },
        success: function (res) {
          console.log(res)
        }, fail: function (res) {
          console.log(res)
        }
      })
      // db.collection('up').doc(this.data.upInfo[index]._id).update({
      //   data: {
      //     upid: Array.from(upSet)
      //   },
      //   success: function (res) {
      //     console.log('取消赞',res)
      //   }
      // })

      this.data.upInfo[index].upid = Array.from(upSet)
      this.data.upItem[index] = false
      this.setData({
        upInfo: this.data.upInfo,
        upItem: this.data.upItem
      })
      
    }else{
      upSet.add(this.data.openid)
      wx.cloud.callFunction({
        name: 'updatedb',
        data: {
          dbname: 'up',
          docid: this.data.upInfo[index]._id,
          dbdata:{
            upid: Array.from(upSet)
          }
        },
         success: function (res) {
          console.log(res)
        }, fail: function (res) {
          console.log(res)
        }
      })
      // db.collection('up').doc(this.data.upInfo[index]._id).update({
      //   data: {
      //     upid: _.push(this.data.openid)
      //   },
      //   success: function (res) {
      //     console.log('点赞',res)
      //   }
      // })
      this.data.upInfo[index].upid.push(this.data.openid)
      this.data.upItem[index] = true
      this.setData({
        upInfo: this.data.upInfo,
        upItem: this.data.upItem
      })

    }

  },
  preImg:function(e){
    let src = e.currentTarget.dataset.src   
    let index = e.currentTarget.dataset.id 
    
      wx.previewImage({
        current: src,
        urls: this.data.albumList[index].res.map(item => item.fileID)
      })

  },
  onShareAppMessage:function(e){
    console.log(e)
    let index = e.target.dataset.id
    
    return {
      title: '分享给好友',
      path: '/pages/photo/index/index?id=' + this.data.albumList[index]._id
        + '&&name=' + app.globalData.userInfo.nickName,
      success: function (res) {
          
      }
    }
  },
  inputFocus(e) {
    console.log(e, '键盘弹起')
    this.setData({
      height: e.detail.height,
      isInput: true
    })
  },
  inputBlur() {
    console.log('键盘收起')
    this.setData({
      isInput: false
    })
  },

  focusButn: function (e) {
    this.setData({
      focusInput: true,
      isInput: true,
      talkid1:e.currentTarget.dataset.talkitemid,
      talkid2:e.currentTarget.dataset.talkid,
      placeholder: '回复' + this.data.chats[e.currentTarget.dataset.talkitemid].chat[e.currentTarget.dataset.talkid].name,
    })
    console.log(this.data.talkid1,this.data.talkid2)
  } ,
  formSubmit: function (e) {
    let that = this
    if (this.data.talkid1 == '-1'){
      this.data.chats.push({
        chat:[{
          context: e.detail.value.comment,
          name: app.globalData.userInfo.nickName,
          replyname:''
        }],
        photoid: this.data.commentphotoid
      })
      console.log('开始添加', this.data.chats)
      db.collection('comment').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          chat: [{
            context: e.detail.value.comment,
            name: app.globalData.userInfo.nickName,
            replyname: ''
          }],
          photoid: this.data.commentphotoid
        },
        success: function (res) {
          // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
          console.log(res)
          console.log('添加评论完成', that.data.chats)
          that.data.chats[that.data.chats.length-1]._id = res._id
        },
        fail: function(res){
          console.log(res)
          console.log('添加评论失败', that.data.chats)
        }
      })
      that.setData({
        chats: that.data.chats
      })

    }else{
      console.log(this.data.talkid2,this.data.talkid2 != '-1')
      if (this.data.talkid2!='-1'){
        console.log(app.globalData.userInfo.nickName + '评论' + this.data.chats[this.data.talkid1].chat[this.data.talkid2].name)
        this.data.chats[this.data.talkid1].chat.push({
          context: e.detail.value.comment,
          name: app.globalData.userInfo.nickName,
          replyname: this.data.chats[this.data.talkid1].chat[this.data.talkid2].name
        })
      }else{
        console.log(app.globalData.userInfo.nickName+'评论')
        this.data.chats[this.data.talkid1].chat.push({
          context: e.detail.value.comment,
          name: app.globalData.userInfo.nickName,
          replyname: ''
        })
      }
      
      let newchat = this.data.chats[this.data.talkid1].chat
      wx.cloud.callFunction({
        name: 'updatedb',
        data: {
          dbname: 'comment',
          docid: that.data.chats[that.data.talkid1]._id,
          dbdata: {
            chat: newchat
          }
        },
        success: function (res) {
          console.log(res)
          that.setData({
            chats: that.data.chats
          })
        },
        fail: function (res) {
          console.log('失败了')
        }
      })
    }
    this.setData({
      formValue:''
    })


    // db.collection('comment').doc(this.data.chats[this.data.talkid1]._id).update({
    //   data: {
    //     chat: {
    //       content: e.detail.value.comment,
    //       name: app.globalData.userInfo.nickName,
    //       replyname: this.data.chats[this.data.talkid1].chat[this.data.talkid2].name
    //     }
    //   },
    //   success: function (res) {
    //     console.log(res)
    //     this.data.chats[this.data.talkid1].chat.push({
    //       content: e.detail.value.comment,
    //       name: app.globalData.userInfo.nickName,
    //       replyname: this.data.chats[this.data.talkid1].chat[this.data.talkid2].name
    //     })
    //     this.setData({
    //       chats: this.data.chats
    //     })
    //   },
    //   fail: function(res){
    //     console.log('失败了')
    //   } 
    // })

  },
  focusButnNew: function (e) {
    this.setData({
      focusInput: true,
      isInput: true,
      talkid1: e.currentTarget.dataset.talkitemid,
      talkid2: '-1',
      commentphotoid: e.currentTarget.dataset.photoid,
      placeholder:'评论..'
    })
    console.log(this.data.talkid1, this.data.talkid2)
  }
})