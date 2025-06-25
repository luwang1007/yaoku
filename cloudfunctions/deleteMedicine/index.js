const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { code } = event
  if (!code) {
    return { success: false, msg: '编号不能为空' }
  }
  const res = await db.collection('medicines').where({ code }).remove()
  if (res.stats.removed > 0) {
    console.log('删除成功', code)
    return { success: true }
  } else {
    console.log('删除失败', code)
    return { success: false, msg: '未找到该药品' }
  }
} 