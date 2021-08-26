<template>
  <div class="menuBox">
    <el-row style="width: 95%; margin: 10px">
      <el-col :span="24" class="menu_query_col">
        <span class="search_font">名称：</span>
        <el-input size="small" v-model="menuName" placeholder="请输入内容" clearable />
        <span class="search_font">类型：</span>
        <el-select class="menu-select" v-model="menuType" placeholder="请选择" clearable>
          <el-option label="menu" value="menu" />
          <el-option label="button" value="button" />
        </el-select>
        <span class="search_font">路由地址：</span>
        <el-input size="small" v-model="menuUrl" placeholder="请输入内容" clearable />
        <span class="search_font">是否可用：</span>
        <el-select v-model="usable" class="menu-select" placeholder="请选择" size="small" clearable  >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
        <el-button size="small" type="primary" icon="el-icon-search" @click="queryMenu">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="resetParam">重置</el-button>
<!--  TODO 菜单暂不支持新增，菜单属于系统初始化之后预置的      -->
<!--        <el-button size="small" type="primary" icon="el-icon-plus" @click="saveSubMenu">新增</el-button>-->
      </el-col>
    </el-row>
    <el-row class="table_row">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 95%;margin: 10px;"
        size="medium"
        row-key="id"
        border
        :header-cell-style="{background:'#304156',color:'#c8d1db'}"
        :tree-props="{children: 'subMenu', hasChildren: 'hasChildren'}"
      >
        <el-table-column
          prop="name"
          label="名称"
          width="210"
        />
        <el-table-column
          prop="resourceType"
          label="类型"
          width="210"
        />
        <el-table-column
          prop="url"
          label="路由地址"
          width="210"
        />
        <el-table-column
          prop="permission"
          label="权限"
          width="210"
        />
        <el-table-column
          prop="available"
          label="是否可用"
          width="210"
        >
          <el-switch
            v-model="scope.row.available"
            slot-scope="scope"
            class="switch"
            active-color="#13ce66"
            inactive-color="#89929AFF"
            :active-value="true"
            :inactive-value="false"
            active-text="是"
            inactive-text="否"
            @change="disableMenu(scope.row)"
            :disabled="!isAdmin"
          />
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
        >
<!--  TODO 菜单暂不支持新增、修改、删除        -->
<!--          <template slot-scope="scope">
            <el-button type="success" size="small" icon="el-icon-plus" @click="saveSubMenu(scope.row)">新增下级</el-button>
            <el-button type="primary" size="small" icon="el-icon-edit" @click="editMenu(scope.row)">修改</el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="delMenu(scope.row.id)">删除</el-button>
          </template>-->

        </el-table-column>
      </el-table>
    </el-row>
    <el-dialog class="dialog_class" :title="dialogTitle" :visible.sync="dialogVisible" :before-close="cancelSave">
      <el-form ref="form" :model="form" :rules="formRule">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单名称:" prop="name">
              <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单类型:" prop="type">
              <el-select v-model="form.type" placeholder="请选择">
                <el-option label="menu" value="menu" />
                <el-option label="button" value="button" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单路径:" prop="url">
              <el-input v-model="form.url" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="父级菜单:" prop="parent">
              <el-input v-model="form.parent" autocomplete="off" :disabled="this.parentId!=='' || this.parentId!=null" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="备注:" prop="remarks">
            <el-input type="textarea" v-model="form.remarks" autocomplete="off" />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSave">取 消</el-button>
        <el-button type="primary" @click="submitSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { saveMenu, queryMenuList, deleteMenu, updateMenu } from '@/api/menu'

export default {
  data() {
    return {
      menuId: '',
      parentId: '',
      tableData: [],
      menuName: '',
      menuType: '',
      menuUrl: '',
      usable: 1,
      dialogVisible: false,
      form: {
        name: '',
        url: '',
        type: '',
        parent: '',
        remarks: ''
      },
      formRule: { // 表单验证规则
        name: [
          { required: true, message: '请输入菜单名称！', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入菜单路径！', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择菜单类型！', trigger: 'blur' }
        ]
      },
      dialogTitle: '新增菜单',
      dialogType: 'add',
      loading: false,
      isAdmin: false
    }
  },
  created() {
    let obj = JSON.parse( sessionStorage.getItem('userInfo') )
    obj.roles.forEach(role => {
      if (role.isAdmin) {
        this.isAdmin = true
      }
    })
    if (obj.id === '1') {
      this.isAdmin = true
    }
    this.getMenuTree()
  },
  methods: {
    getMenuTree() {
      this.loading = true
      queryMenuList({}).then(res => {
        this.loading = false
        if (res.code === '0') {
          this.tableData = res.data
        } else {
          this.loading = false
          console.log(res.msg)
        }
      }).catch(e => {
        console.log(e)
      })
    },
    saveSubMenu(row) {
      this.dialogTitle = '新增菜单'
      this.dialogType = 'add'
      this.dialogVisible = true
      this.form = {
        type: '',
        url: '',
        name: '',
        remarks: ''
      }
      if (row.id != null) {
        this.parentId = row.id
        this.form.parent = row.name
      } else {
        this.parentId = ''
        this.form.parent = ''
      }
    },
    editMenu(row) {
      this.dialogVisible = true
      this.dialogType = 'update'
      this.dialogTitle = '更新菜单'
      this.menuId = row.id
      this.form = {
        type: row.resourceType,
        url: row.url,
        name: row.name,
        remarks: row.remarks
      }
      this.parentId = row.parentId
      this.tableData.forEach(node => {
      if (row.parentId == null || row.parentId === '') {
        this.parentId = ''
        this.form.parent = ''
      } else if (node.id === row.parentId) {
        this.parentId = node.id
        this.form.parent = node.name
      }
      })
    },
    delMenu(menuId) {
      this.$confirm('确定删除此菜单吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log(menuId)
        const params = {
          ids: [menuId]
        }
        deleteMenu(params).then(res => {
          if (res.code === '0') {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.getMenuTree()
          } else {
            this.$message({
              type: 'warning',
              message: res.msg
            })
          }
        })
      }).catch(() => {})
    },
    submitSave() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.dialogType === 'add') {
            const data = {
              name: this.form.name,
              resourceType: this.form.type,
              url: this.form.url,
              available: true,
              parentId: this.parentId
            }
            saveMenu(data).then(res => {
              if (res.code === '0') {
                this.$message({
                  type: 'success',
                  message: res.msg
                })
                this.getMenuTree()
                this.dialogVisible = false
              } else {
                this.$message({
                  type: 'warning',
                  message: res.msg
                })
                this.dialogVisible = false
              }
            })
          }
          if (this.dialogType === 'update') {
              updateMenu({
                id: this.menuId,
                name: this.form.name,
                resourceType: this.form.type,
                url: this.form.url,
                parentId: this.parentId,
                remarks: this.form.remarks
              }).then(res => {
                if (res.code === '0') {
                  this.$message({
                    type: 'success',
                    message: res.msg
                  })
                  this.getMenuTree()
                  this.dialogVisible = false
                } else {
                  this.$message({
                    type: 'warning',
                    message: res.msg
                  })
                  this.dialogVisible = false
                }
              })
          }
        }
      })
    },
    cancelSave() {
      this.$refs['form'].resetFields()
      this.dialogVisible = false
    },
    queryMenu() {
      this.loading = true
      const data = {
        name: this.menuName,
        url: this.menuUrl,
        resourceType: this.menuType,
        available: this.usable
      }
      queryMenuList(data).then(res => {
        if (res.code === '0') {
          this.loading = false
          this.tableData = res.data
        } else {
          this.loading = false
          console.log(res.msg)
        }
      })
    },
    disableMenu(row) {
      updateMenu({
        id: row.id,
        available: row.available
      }).then(res => {
        if (res.code === '0') {
          this.$message({
            type: 'success',
            message: res.msg
          })
          // this.getMenuTree()
        } else {
          this.$message({
            type: 'warning',
            message: res.msg
          })
        }
      })
    },
    resetParam() {
      this.menuName = ''
      this.menuType = ''
      this.menuUrl = ''
      this.usable = 1
      this.getMenuTree()
    }
  }
}
</script>

<style scoped>
.search_font {
  font-size: 14px;
}
.menu-select .el-input {
  width: 85% !important;
}
.menu-select .el-input__suffix{
  margin-top: 5px;
}

.menu_query_col .el-input,
.menu_query_col .el-select {
  width: 12%;
  margin-right: 3.5%;
}

.menu_query_col .el-input input {
  height: 30px;
  line-height: 30px;
}

.el-form-item__content .el-select {
  display: block;
}

.el-form-item__content .el-select .el-input__suffix {
  top: 18px;
}
.table_row /deep/ .el-table .el-table__header-wrapper th,
.table_row /deep/ .el-table .el-table__body-wrapper td {
  font-size: 12px ;
  padding: 6px 0px ;
  text-align: center;
}
.table_row /deep/ .el-table .el-table__header-wrapper th{
  background: #304156;
  color: #c8d1db;
}
.dialog_class /deep/ .el-input__suffix{
  margin-top: 20px;
}

/* switch按钮样式 */
.menuBox /deep/.switch .el-switch__label {
  position: absolute;
  display: none;
  color: #fff !important;
}
/*打开时文字位置设置*/
.menuBox /deep/.switch .el-switch__label--right {
  z-index: 1;
}
/*关闭时文字位置设置*/
.menuBox /deep/.switch .el-switch__label--left {
  z-index: 1;
}
/* 调整关闭时文字的显示位子 */
.menuBox /deep/.switch .el-switch__label--left span{
  margin-left: 19px;
}
/*显示文字*/
.menuBox /deep/.switch .el-switch__label.is-active {
  display: block;
}
/* 调整按钮的宽度 */
.menuBox /deep/.switch.el-switch .el-switch__core,
.el-switch .el-switch__label {
  width: 45px !important;
  margin: 0;
}
</style>
