<template>
  <div>
    <el-table v-loading="loading"
              :data="playlist"
              stripe>
      <el-table-column type="index"
                       width="50" />
      <el-table-column label="封面"
                       width="100">
        <template slot-scope="scope">
          <img :src="scope.row.picUrl"
               alt
               height="50">
        </template>
      </el-table-column>
      <el-table-column prop="name"
                       label="名称" />
      <el-table-column prop="copywriter"
                       label="描述" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini"
                     @click="onEdit(scope.row)">编辑</el-button>
          <el-button size="mini"
                     type="danger"
                     @click="onDel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 确认删除的对话框 -->
    <el-dialog title="提示"
               :visible.sync="delDialogVisible"
               width="30%">
      <span>确定删除该歌单吗</span>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="delDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="doDel">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 跨域
// http://www.a.com  http://www.b.com
// http://www.a.com:8080  http://www.a.com:8081
// http://www.a.com   http://news.a.com
// http://www.a.com   https://www.a.com

import { fetchList, del } from '@/api/playlist'
import scroll from '@/utils/scroll'

export default {
  data () {
    return {
      playlist: [],
      count: 50,
      loading: false,
      // 删除歌单的对话框是否显示
      delDialogVisible: false,
      info: {}
    }
  },
  created () {
    this.getList()
  },
  mounted () {
    // 下拉刷新
    scroll.start(this.getList)
  },
  methods: {
    getList () {
      this.loading = true
      fetchList({
        start: this.playlist.length,
        count: this.count
      }).then(res => {
        console.log(res)
        this.playlist = this.playlist.concat(res.data)
        if (res.data.length < this.count) {
          // 比如130条，30<50就停止刷新
          scroll.end()
        }
        this.loading = false
      })
    },
    // 修改
    onEdit (row) {
      // 修改，跳转到修改页面并携带id
      this.$router.push(`/playlist/edit/${row._id}`)
    },
    // 弹出是否删除对话框
    onDel (row) {
      this.delDialogVisible = true
      this.info.id = row._id
    },
    // 删除
    doDel () {
      // 传id
      del({ id: this.info.id }).then(res => {
        // 关闭弹框
        this.delDialogVisible = false
        // 删除条数大于0
        if (res.data.deleted > 0) {
          // 歌单列表清空
          this.playlist = []
          // 再获取一次歌单信息
          this.getList()
          this.$message({
            message: '删除成功',
            type: 'success'
          })
        } else {
          this.$message.error('删除失败')
        }
      })
    }
  }
}
</script>

<style>
</style>
