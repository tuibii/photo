// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  var dbname = event.dbname
  var docid = event.docid
  var dbdata = event.dbdata

  console.log(dbname, docid, dbdata)
  
  try {
    return await db.collection(dbname).doc(docid).update({
      data: dbdata
    })
  } catch (e) {
    console.log(e)
  }
}