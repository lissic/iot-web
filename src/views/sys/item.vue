<template>
  <div class="alarm_item_box">
    <el-row>
      <el-col :span="24" class="alarm_item_col">
        <span class="search_font">名称：</span>
        <el-input
          size="small"
          v-model="itemName"
          @keyup.enter.native="queryItem"
          placeholder="请输入内容"
          clearable
        />
        <span class="search_font">编码：</span>
        <el-input
          size="small"
          v-model="itemCode"
          @keyup.enter.native="queryItem"
          placeholder="请输入内容"
          clearable
        />
        <span class="search_font">标准值：</span>
        <el-input
          size="small"
          v-model="standardVal"
          @keyup.enter.native="queryItem"
          placeholder="请输入内容"
          clearable
        />
        <span class="search_font">阈值：</span>
        <el-input
          size="small"
          v-model="thresholdVal"
          @keyup.enter.native="queryItem"
          placeholder="请输入内容"
          clearable
        />
        <span class="search_font">备注：</span>
        <el-input
          size="small"
          v-model="remarks"
          @keyup.enter.native="queryItem"
          placeholder="请输入内容"
          clearable
        />
        <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="resetParam">重置</el-button>
        <el-button
          v-if="isAdminRole == true"
          size="small"
          type="success"
          icon="el-icon-circle-plus-outline"
          @click="saveItem"
        >新增</el-button>
        <el-button v-if="isAdminRole == true" size="small" type="danger" :disabled="delFlag" @click="delItem()">删除</el-button>
      </el-col>
    </el-row>
    <el-row class="table_row">
      <el-table
        border
        :header-cell-style="{background:'#304156',color:'#c8d1db'}"
        ref="multipleTable"
        v-loading="loading"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 95%; margin: 10px;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="itemName" label="告警项名称" width="200"></el-table-column>
        <el-table-column prop="itemCode" label="告警项编码" width="200"></el-table-column>
        <el-table-column prop="standardVal" label="标准值"></el-table-column>
        <el-table-column prop="thresholdVal" label="阈值"></el-table-column>
        <el-table-column prop="createUser" label="创建人"></el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column prop="remarks" label="备注" width="300"></el-table-column>
        <el-table-column v-if="showOperation" label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              v-if="isAdminRole == true"
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="editItem(scope.row)"
            >修改</el-button>
            <el-button
              v-if="isAdminRole == true"
              type="danger"
              size="small"
              icon="el-icon-delete"
              :disabled="itemCodes.indexOf(scope.row.itemCode)>-1"
              @click="delItem([scope.row.id])"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-row>
      <el-pagination
        background
        :current-page="current"
        :page-sizes="[10, 20, 30]"
        :page-size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-row>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :before-close="cancelSave">
      <el-form ref="form" :model="form" :rules="formRule">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="告警项名称:" prop="itemName">
              <el-input v-model="form.itemName" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="告警项编码:" prop="itemCode">
              <el-input
                v-model="form.itemCode"
                placeholder="请输入内容"
                :disabled="this.dialogType === 'update'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标准值:" prop="standardVal">
              <el-input v-model="form.standardVal" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="阈值:" prop="thresholdVal">
              <el-input v-model="form.thresholdVal" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="备注:" prop="remarks">
            <el-input type="textarea" v-model="form.remarks" placeholder="请输入内容" />
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
import {
  getAlarmItemPage,
  saveAlarmItem,
  updateAlarmItem,
  delAlarmItem
} from "@/api/alarm";
import { getInfo } from '@/api/user'

export default {
  data() {
    return {
      itemId: "",
      itemName: "",
      itemCode: "",
      standardVal: "",
      thresholdVal: "",
      remarks: "",
      tableData: [],
      current: 1,
      size: 10,
      total: 0,
      userInfo:[],
      isAdminRole:false,
      showOperation:false,
      multipleSelection: [],
      form: {
        itemName: "",
        itemCode: "",
        standardVal: "",
        thresholdVal: "",
        remarks: ""
      },
      dialogType: "add",
      dialogTitle: "新增告警项",
      dialogVisible: false,
      formRule: {
        // 表单验证规则
        itemName: {
          required: true,
          message: "请输入告警项名称！",
          trigger: "blur"
        },
        itemCode: [
          { required: true, message: "请输入告警项编码！", trigger: "blur" },
          {
            pattern: /^[A-Za-z0-9]+$/,
            message: "编码只能为数字或字母！",
            trigger: "blur"
          }
        ],
        standardVal: [
          { required: true, message: "输入内容不合法！", trigger: "blur" },
          {
            pattern: /^[1-9]\d*$/,
            message: "输入内容不合法！",
            trigger: "blur"
          }
        ],
        thresholdVal: [
          { required: true, message: "输入内容不合法！", trigger: "blur" },
          {
            pattern: /^[1-9]\d*$/,
            message: "输入内容不合法！",
            trigger: "blur"
          }
        ]
      },
      loading: false,
      itemCodes: ["3001", "3002", "3003"]
    };
  },
  created() {
    this.getUserInfo();
    this.queryItem();
  },
  computed: {
    delFlag() {
      // 禁用删除按钮
      return this.multipleSelection.length <= 0;
    }
  },
  methods: {
    queryItem() {
      this.loading = true;
      getAlarmItemPage({
        itemName: this.itemName,
        itemCode: this.itemCode,
        standardVal: this.standardVal,
        thresholdVal: this.thresholdVal,
        remarks: this.remarks,
        pageNo: this.current,
        pageSize: this.size
      })
        .then(res => {
          if (res.code === "0") {
            this.loading = false;
            this.tableData = res.data.list;
            this.current = res.data.current;
            this.size = res.data.size;
            this.total = res.data.total;
          } else {
            this.$message({
              type: "error",
              message: "查询失败！"
            });
          }
        })
        .catch(e => {
          console.warn(e);
        });
    },
    getUserInfo(){
      getInfo().then(res =>{
        if(res.code==='0'){
          this.userInfo = res.data
          this.handleJustifyRole()
        }
      }).catch( e =>{
        console.log(e)
      })
    },
    // 判断当前登录用户是否拥有管理员角色
    handleJustifyRole(){
      this.userInfo.roles.forEach(item =>{
        if (item.isAdmin == true){
          this.isAdminRole = true
          this.showOperation = true
          return
        }
      })
    },
    handleSearch() {
      this.loading = true;
      getAlarmItemPage({
        itemName: this.itemName,
        itemCode: this.itemCode,
        standardVal: this.standardVal,
        thresholdVal: this.thresholdVal,
        remarks: this.remarks,
        pageSize: this.size
      })
        .then(res => {
          if (res.code === "0") {
            this.loading = false;
            this.tableData = res.data.list;
            this.current = res.data.current;
            this.size = res.data.size;
            this.total = res.data.total;
          } else {
            this.$message({
              type: "error",
              message: "查询失败！"
            });
          }
        })
        .catch(e => {
          console.warn(e);
        });
    },
    saveItem() {
      this.dialogTitle = "新增告警项";
      this.dialogType = "add";
      this.dialogVisible = true;
      this.$refs["form"].resetFields();
    },
    editItem(row) {
      this.dialogType = "update";
      this.dialogVisible = true;
      this.dialogTitle = "更新告警项";
      this.itemId = row.id;
      this.form.itemName = row.itemName;
      this.form.itemCode = row.itemCode;
      this.form.standardVal = row.standardVal;
      this.form.thresholdVal = row.thresholdVal;
      this.form.remarks = row.remarks;
    },
    delItem(ids) {
      let param = [];
      if (ids == null && this.multipleSelection != null) {
        this.multipleSelection.forEach(item => {
          param.push(item.id);
        });
      } else {
        param = ids;
      }
      this.$confirm("确定删除此项吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        delAlarmItem({ ids: param })
          .then(res => {
            if (res.code === "0") {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.queryItem();
            } else {
              this.$message({
                type: "error",
                message: "删除失败！"
              });
            }
          })
          .catch(e => {
            console.log(e);
          });
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleSizeChange(val) {
      this.size = val;
      this.queryItem();
    },
    handleCurrentChange(val) {
      this.current = val;
      this.queryItem();
    },
    cancelSave() {
      this.$refs["form"].resetFields();
      this.dialogVisible = false;
    },
    submitSave() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.dialogType === "add") {
            saveAlarmItem({
              itemName: this.form.itemName,
              itemCode: this.form.itemCode,
              standardVal: this.form.standardVal,
              thresholdVal: this.form.thresholdVal,
              remarks: this.form.remarks
            })
              .then(res => {
                if (res.code === "0") {
                  this.$message({
                    type: "success",
                    message: "新增成功！"
                  });
                  this.dialogVisible = false;
                  this.queryItem();
                } else {
                  this.$message({
                    type: "error",
                    message: "新增失败！"
                  });
                  this.dialogVisible = false;
                }
              })
              .catch(e => {
                console.warn(e);
              });
          }
          if (this.dialogType === "update") {
            updateAlarmItem({
              id: this.itemId,
              itemName: this.form.itemName,
              itemCode: this.form.itemCode,
              standardVal: this.form.standardVal,
              thresholdVal: this.form.thresholdVal,
              remarks: this.form.remarks
            })
              .then(res => {
                if (res.code === "0") {
                  this.$message({
                    type: "success",
                    message: "更新成功！"
                  });
                  this.dialogVisible = false;
                  this.queryItem();
                } else {
                  this.$message({
                    type: "error",
                    message: "更新失败！"
                  });
                  this.dialogVisible = false;
                }
              })
              .catch(e => {
                console.warn(e);
              });
          }
        }
      });
    },
    resetParam() {
      this.itemName = "";
      this.itemCode = "";
      this.standardVal = "";
      this.thresholdVal = "";
      this.remarks = "";
      this.current = 1;
      this.size = 10;
      this.queryItem();
    }
  }
};
</script>

<style scoped>
.search_font {
  font-size: 14px;
}
.alarm_item_col {
  margin: 10px;
}
.alarm_item_col .el-input {
  width: 9.5%;
  margin-right: 1%;
}
.table_row .el-button {
  font-size: 12px;
  padding: 5px;
}
.table_row /deep/ .el-table .el-table__header-wrapper th,
.table_row /deep/ .el-table .el-table__body-wrapper td {
  font-size: 12px;
  padding: 6px 0px;
  text-align: center;
}
.table_row /deep/ .el-table .el-table__header-wrapper th {
  background: #304156;
  color: #c8d1db;
}
</style>
