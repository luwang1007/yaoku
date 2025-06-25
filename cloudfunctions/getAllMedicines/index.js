const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const MAX_LIMIT = 100

exports.main = async (event, context) => {
  try {
    // 先取得集合记录总数
    const countResult = await db.collection('medicines').count()
    const total = countResult.total
    
    // 计算需要分几次取
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('medicines')
        .skip(i * MAX_LIMIT)
        .limit(MAX_LIMIT)
        .get()
      tasks.push(promise)
    }
    
    // 等待所有数据取完
    const results = await Promise.all(tasks)
    
    // 把数据合并到一个数组
    let medicines = []
    results.forEach(result => {
      medicines = medicines.concat(result.data)
    })

    console.log('获取到药品总数:', medicines.length)
    
    return {
      success: true,
      data: medicines,
      total: total
    }
  } catch (err) {
    console.error('获取药品失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
} 