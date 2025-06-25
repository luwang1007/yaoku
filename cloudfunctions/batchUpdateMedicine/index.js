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
    let successCount = 0
    let failCount = 0
    
    // 分批处理数据
    for (let i = 0; i < batchTimes; i++) {
      // 获取这一批数据
      const medicines = await db.collection('medicines')
        .skip(i * MAX_LIMIT)
        .limit(MAX_LIMIT)
        .get()
      
      console.log(`处理第 ${i + 1}/${batchTimes} 批，本批数量: ${medicines.data.length}`)
      
      // 处理这一批数据
      for (let medicine of medicines.data) {
        if (medicine.name && medicine.name.includes('请输入药名和编号（用空格分隔）')) {
          try {
            // 清理名称中的提示文字
            const cleanName = medicine.name.replace('请输入药名和编号（用空格分隔）', '').trim()
            
            // 更新数据库
            await db.collection('medicines').doc(medicine._id).update({
              data: {
                name: cleanName
              }
            })
            
            console.log('更新成功:', medicine._id, cleanName)
            successCount++
          } catch (err) {
            console.error('更新失败:', medicine._id, err)
            failCount++
          }
        }
      }
    }
    
    console.log('处理完成，总数:', total, '成功:', successCount, '失败:', failCount)
    
    return {
      success: true,
      stats: {
        total: total,
        updated: successCount,
        failed: failCount,
        skipped: total - successCount - failCount
      }
    }
  } catch (err) {
    console.error('批量处理失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
} 