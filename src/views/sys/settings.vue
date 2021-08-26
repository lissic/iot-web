<template>
  <div class="settingBox">
    <el-tabs clas="table_box">
      <el-tab-pane label="全部设置">
        <el-row class="table_row">
          <el-table
            :data="list"
            stripe
            border
            style="width: 100%">
            <el-table-column
              prop="settingOption"
              label="设置项"
            />
            <el-table-column
              prop="settingContent"
              label="设置内容"
            />
            <el-table-column
              prop="remarks"
              label="备注"
            />
            <el-table-column
              label="操作"
            >
              <template slot-scope="scope">
                <el-button type="success" size="small" icon="el-icon-edit" @click="handleEdit(scope.row)" plain>编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="皮肤设置">
        <el-card shadow="hover">
          <el-form class="skin_content" :model="list" v-loading="loading" label-position="right" label-width="90px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="设置项：">
                  <span>换肤</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="皮肤类别：">
                  <el-select v-model="list.content">
                    <el-option label="暗黑色" :value="0" />
                    <el-option label="亮白色" :value="1" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="10">
                <el-form-item label="备注：">
                  <el-input v-model="list.remarks" type="textarea" :rows="4" maxlength="100" show-word-limit placeholder="备注信息"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="语言设置">
        <el-card shadow="hover">
          <el-form class="language_content" :model="list" v-loading="loading" label-position="right" label-width="90px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="设置项：">
                  <span>语言</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="语言类别：">
                  <el-select v-model="list.content">
                    <el-option label="中文（简体）" :value="0" />
                    <el-option label="中文（繁体）" :value="1" />
                    <el-option label="英 文" :value="2"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="10">
                <el-form-item label="备注：">
                  <el-input v-model="list.remarks" type="textarea" :rows="4" maxlength="100" show-word-limit placeholder="备注信息"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>

    </el-tabs>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="60%"
      :before-close="handleCancel"
    >
      <el-form ref="form" :rules="formRule" :model="form" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设置项:" prop="settingOption">
              <el-input v-model="form.settingOption" placeholder="请输入设置项" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设置内容:" prop="settingContent">
              <el-select v-model="form.settingContent" placeholder="请输入设置内容" clearable>
                <el-option label="中文(简体)" :value="1" />
                <el-option label="中文(繁体)" :value="2" />
                <el-option label="英语" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="备注:">
              <el-input v-model="form.remarks" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleDetermine">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { settingSave, settingPage } from '@/api/sys'
  export default {
    data() {
      return {
        list: [], // 表格数据
        current: 1,
        size: 10,
        total: 0,
        dialogTitle: '新增设置', // 弹框标题
        dialogVisible: false, // 弹框显示隐藏
        form: { // 弹框表单数据
          settingOption: '',
          settingContent: ''
        },
        formRule: { // 表单验证规则
          settingOption: [
            { required: true, message: '请输入设置项名称', trigger: 'blur' }
          ],
          settingContent: [
            { required: true, message: '请输入设置内容', trigger: 'blur' }
          ],
          remarks: [
            { required: false, message: '请输入备注信息', trigger: 'blur' }
          ]
        },
        dialogType: 'add', // 弹框类型，新增or编辑
        searchSettingId: '', // 搜索设置项
        settingList: []
      }
    },
    created() {
      this.getSettingList()
    },
    methods: {
      // 获取用户列表
      getSettingList() {
        this.loading = true
        settingPage({}).then(res => {
          // eslint-disable-next-line eqeqeq
          if (res.code == 0) {
            this.loading = false
            this.list = res.data.list
            this.current = res.data.current
            this.size = res.data.size
            this.total = res.data.total
          }
        }).catch(e => {
          console.log(e)
        })
      },
      // 编辑
      handleEdit(row) {
        console.log(row)
        this.dialogType = 'edit'
        this.dialogTitle = '编辑设置'
        this.updateId = row.id
        this.form = {
          settingOption: row.settingOption,
          settingContent: row.settingContent,
          remarks: row.remarks
        }
        this.dialogVisible = true
      },
      handleDialogClose() {
        this.dialogVisible = false
      },
      // 确定
      handleDetermine() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            // eslint-disable-next-line eqeqeq
            if (this.dialogType == 'add') {
              console.log(this.form)
              settingSave(this.form).then(res => {
                // eslint-disable-next-line eqeqeq
                if (res.code == 0) {
                  this.$message({
                    type: 'success',
                    message: res.msg
                  })
                  this.getSettingList()
                  this.dialogVisible = false
                } else {
                  this.$message({
                    type: 'warming',
                    message: res.msg
                  })
                  this.dialogVisible = false
                }
              })
            }
            // eslint-disable-next-line eqeqeq
            if (this.dialogType == 'edit') {
              const data = {
                id: this.updateId,
                settingOption: this.form.settingOption,
                settingContent: this.form.settingContent,
                remarks: this.form.remarks
              }
            }
          }
        })
      },
      // 取消
      handleCancel(type) {
        this.$refs['form'].resetFields()
        this.form.settingOption = ''
        this.form.settingContent = ''
        this.form.remarks = ''
        this.dialogVisible = false
      }
    }
  }
</script>

<style scoped>
  .el-button {
    font-size: 12px;
    padding: 6px;
  }

  .settingBox {
    padding: 10px;
  }
  .table_row /deep/ .el-table .el-table__header-wrapper th,
  .table_row /deep/ .el-table .el-table__body-wrapper td {
    font-size: 12px;
    padding: 6px 0px;
    text-align: center;
  }

  .table_row /deep/ .el-table .el-table__header-wrapper th {
    /* background: #1f2d3d ; */
    background: #304156;
    color: #c8d1db;
  }

  .search_col .el-input,
  .search_col .el-select {
    width: 15%;
    margin-right: 10px;
  }

  .search_col .el-input input {
    height: 28px;
    line-height: 28px;
  }
  .table_box {
    height: 400px;
  }
</style>
