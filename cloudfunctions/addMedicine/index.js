const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { name, code } = event
  if (!name || !code) {
    console.log('添加失败：药名或编号为空', { name, code })
    return { success: false, msg: '药名和编号不能为空' }
  }
  // 检查是否已存在
  const exist = await db.collection('medicines').where({
    $or: [{ name }, { code }]
  }).get()
  if (exist.data.length > 0) {
    console.log('添加失败：药名或编号已存在', { name, code })
    return { success: false, msg: '药名或编号已存在' }
  }
  await db.collection('medicines').add({ data: { name, code } })
  console.log('添加成功', { name, code })
  return { success: true }
} 