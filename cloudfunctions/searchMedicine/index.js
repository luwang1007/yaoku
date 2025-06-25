const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { keyword } = event
  if (!keyword) return { data: [] }
  // 支持模糊搜索
  const res = await db.collection('medicines').where(
    db.command.or([
      { name: db.RegExp({ regexp: keyword, options: 'i' }) },
      { code: db.RegExp({ regexp: keyword, options: 'i' }) }
    ])
  ).get()
  return { data: res.data }
} 