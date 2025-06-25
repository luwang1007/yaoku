Page({
  data: {
    searchValue: '',
    medicines: []
  },
  onLoad() {
    this.loadAllMedicines()
  },
  onShow() {
    this.loadAllMedicines()
  },
  onSearchInput(e) {
    const value = e.detail.value
    this.setData({ searchValue: value })
    if (value) {
      wx.cloud.callFunction({
        name: 'searchMedicine',
        data: { keyword: value },
        success: res => {
          this.setData({ medicines: res.result.data })
        }
      })
    } else {
      this.loadAllMedicines()
    }
  },
  async loadAllMedicines() {
    wx.showLoading({ title: '加载中...' })
    try {
      const result = await wx.cloud.callFunction({
        name: 'getAllMedicines'
      })
      
      if (result.result.success) {
        this.setData({ 
          medicines: result.result.data 
        })
        console.log('加载到药品数量:', result.result.data.length)
      } else {
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        })
      }
    } catch (err) {
      console.error('加载药品失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },
  onAddTap() {
    wx.showModal({
      title: '添加药品',
      content: '请输入药名和编号（用空格分隔）',
      editable: true,
      placeholderText: '如：阿莫西林 123456',
      success: (res) => {
        if (res.confirm && res.content) {
          const [name, code] = res.content.split(' ')
          if (!name || !code) {
            wx.showToast({ title: '格式错误', icon: 'none' })
            return
          }
          wx.cloud.callFunction({
            name: 'addMedicine',
            data: { name, code },
            success: (r) => {
              if (r.result.success) {
                wx.showToast({ title: '添加成功' })
                this.loadAllMedicines()
              } else {
                wx.showToast({ title: r.result.msg, icon: 'none' })
              }
            }
          })
        }
      }
    })
  },
  onMedicineLongPress(e) {
    const code = e.currentTarget.dataset.code
    const name = e.currentTarget.dataset.name
    wx.showModal({
      title: '删除药品',
      content: `确定要删除"${name}"吗？`,
      confirmText: '删除',
      confirmColor: '#e54d42',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'deleteMedicine',
            data: { code },
            success: (r) => {
              if (r.result.success) {
                wx.showToast({ title: '删除成功' })
                this.loadAllMedicines()
              } else {
                wx.showToast({ title: r.result.msg, icon: 'none' })
              }
            }
          })
        }
      }
    })
  },
  // 批量更新数据
  async batchUpdateData() {
    wx.showLoading({ title: '处理中...' })
    try {
      const res = await wx.cloud.callFunction({
        name: 'batchUpdateMedicine'
      })
      wx.hideLoading()
      if (res.result.success) {
        const stats = res.result.stats
        wx.showModal({
          title: '处理完成',
          content: `总数：${stats.total}\n更新：${stats.updated}\n失败：${stats.failed}\n跳过：${stats.skipped}`,
          showCancel: false
        })
        // 刷新列表
        this.loadAllMedicines()
      } else {
        wx.showToast({ 
          title: '处理失败', 
          icon: 'error' 
        })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ 
        title: '处理失败', 
        icon: 'error' 
      })
    }
  }
}) 