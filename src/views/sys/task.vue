
<template>
  <div class="taskBox">
    <el-row class="top">
      <el-col :span="24" class="search_col">
        <span>任务名称：</span>
        <el-input
          v-model="params.taskName"
          @keyup.enter.native="handleSearch"
          placeholder="请输入任务名称"
          clearable
        />
        <span>任务状态：</span>
        <el-select v-model="params.status">
          <el-option label="暂停" :value="0" />
          <el-option label="运行中" :value="1" />
        </el-select>

        <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="handleRefresh">重置</el-button>
        <el-button
          size="small"
          type="success"
          class="add_btn"
          icon="el-icon-circle-plus-outline"
          @click="addTask"
        >新增</el-button>
        <el-button
          size="small"
          type="danger"
          icon="el-icon-delete"
          :disabled="deletDis"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-row class="table_row">
      <el-table
        stripe
        border
        style="width: 100%"
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="任务名称"></el-table-column>
        <el-table-column prop="description" label="任务描述"></el-table-column>
        <el-table-column prop="invokeTarget" label="调用目标字符串"></el-table-column>
        <el-table-column prop="expression" label="周期表达式"></el-table-column>
        <el-table-column prop="lastExecTime" label="上次运行时间"></el-table-column>
        <el-table-column prop="nextExecTime" label="下次运行时间"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <span v-show="scope.row.status==0" style="color:red;">暂停</span>
            <span v-show="scope.row.status==1" style="color:green;">运行中</span>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注"></el-table-column>
        <el-table-column prop="address" width="200" label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-video-play"
              size="mini"
              title="启动"
              :disabled="scope.row.status==1"
              @click="handleImplement(scope.row)"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-video-pause"
              size="mini"
              title="暂停"
              :disabled="scope.row.status==0"
              @click="handleRecovery(scope.row)"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-edit"
              size="mini"
              title="编辑"
              @click="handleEdit(scope.row)"
            ></el-button>
            <!-- <el-button
              type="primary"
              icon="el-icon-document-copy"
              size="mini"
              title="日志"
              @click="handleLog(scope.row)"
            ></el-button>-->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除"
              @click="handleDelOne(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-row class="page">
      <el-pagination
        background
        :current-page="params.pageNo"
        :page-sizes="[10, 20, 30]"
        :page-size="params.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-row>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      :before-close="handleCancel"
    >
      <el-form
        ref="form"
        v-show="dialogType !='log' "
        :rules="formRule"
        :model="form"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务名称:" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="任务描述:" prop="description">
              <el-input v-model="form.description" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="调用目标串:" prop="invokeTarget">
              <el-input v-model="form.invokeTarget" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label=" Cron执行表达式:" prop="expression">
              <easy-cron
                style="width: 700px;"
                v-model="form.expression"
                :exeStartTime="exeStartTime"
              ></easy-cron>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注:">
              <el-input v-model="form.remarks" />
              <div>提示：备注信息不能超过200个字符！</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" v-show="dialogType !='log' " class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleDetermine">确 定</el-button>
      </span>
      <el-row class="table_row" v-show="dialogType =='log' ">
        <el-table stripe border style="width: 100%" :data="tableData">
          <el-table-column prop="date" label="任务名称"></el-table-column>
          <el-table-column prop="name" label="任务分组"></el-table-column>
          <el-table-column prop="address" label="任务描述"></el-table-column>
          <el-table-column prop="date" label="调用目标字符串" width="180"></el-table-column>
        </el-table>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import EasyCron from "@/components/easy-cron";
import InputCron from "@/components/easy-cron/input-cron";
import CronValidator from "@/components/easy-cron/validator";
import { time } from "echarts";
import {
  taskPage,
  taskSave,
  taskUpdate,
  taskDelete,
  startTask,
  stopTask
} from "@/api/sys";

export default {
  name: "task",
  // 任务状态：0-暂停;1-运行中
  data() {
    return {
      params: {
        name: "",
        status: "",
        pageNo: 1,
        pageSize: 10
      },
      loading: false,
      tableData: [],
      searchNn: "",
      searchGp: "",
      dialogTitle: "新增任务",
      dialogVisible: false,
      dialogType: "add", // 弹框类型，新增or编辑
      total: 0,
      form: {
        name: "",
        description: "",
        invokeTarget: "",
        expression: "",
        remarks: ""
      },
      updateId: "",
      formRule: {
        // 表单验证规则
        name: [
          { required: true, message: "请输入任务名称！", trigger: "blur" },
          {
            required: true,
            min: 2,
            max: 16,
            message: "格式有误，长度应在2-16位之间！",
            trigger: "blur"
          }
        ],
        description: [
          { required: true, message: "请输入任务描述！", trigger: "blur" },
          {
            required: true,
            max: 100,
            message: "格式有误，长度不能超过100位！",
            trigger: "blur"
          }
        ],
        invokeTarget: [
          { required: true, message: "请输入调用目标串！", trigger: "blur" }
        ],
        expression: [
          { required: true, message: "请选择cron表达式！", trigger: "blur" }
        ]
      },
      multipleSelection: [],

      exeStartTime: ""
    };
  },
  components: {
    EasyCron,
    InputCron
  },
  watch: {
    "form.expression"(newVal, oldVal) {
      console.log(newVal);
      this.form.expression = newVal;
    }
  },
  computed: {
    deletDis() {
      // 禁用删除按钮
      if (this.multipleSelection.length > 0) {
        return false;
      } else {
        return true;
      }
    },
    inputDisabled() {
      if (this.dialogType == "add") {
        return false;
      } else {
        return true;
      }
    }
  },
  created() {
    this.getTaskPage();
  },
  methods: {
    getTaskPage() {
      this.loading = true;
      taskPage(this.params)
        .then(res => {
          if (res.code === "0") {
            this.loading = false;
            this.tableData = res.data.list;
            this.params.pageSize = res.data.size;
            this.params.pageNo = res.data.current;
            this.total = res.data.total;
          }
        })
        .catch(e => {
          this.loading = false;
        });
    },
    //搜索
    handleSearch() {
      this.params.pageNo = 1;
      this.getTaskPage();
    },
    //重置
    handleRefresh() {
      this.params = {
        taskName: "",
        status: "",
        pageNo: 1,
        pageSize: 10
      };
      this.getTaskPage();
    },
    //新增任务
    addTask() {
      this.dialogVisible = true;
      this.dialogTitle = "新增任务";
      this.dialogType = "add";
      this.getCurrentDate();
    },
    //多个删除
    handleDelete() {
      this.$confirm("确定要删除此任务吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const ids = [];
          this.multipleSelection.forEach(item => {
            ids.push(item.id);
          });
          taskDelete({ ids: ids }).then(res => {
            if (res.code === "0") {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.handleRefresh();
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //编辑
    handleEdit(row) {
      this.dialogTitle = "编辑任务";
      this.dialogType = "edit";
      this.getCurrentDate();
      console.log(row);
      this.updateId = row.id;
      this.form.name = row.name;
      this.form.description = row.description;
      this.form.invokeTarget = row.invokeTarget;
      this.form.expression = row.expression;
      this.form.remarks = row.remarks;
      this.dialogVisible = true;
    },
    //日志
    // handleLog() {
    //   this.dialogVisible = true;
    //   this.dialogTitle = "查看日志";
    //   this.dialogType = "log";
    // },
    //删除某一项
    handleDelOne(row) {
      this.$confirm("确定要删除此任务吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let ids = [];
          ids.push(row.id);
          taskDelete({ ids: ids }).then(res => {
            if (res.code === "0") {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.handleRefresh();
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //启动
    handleImplement(row) {
      startTask({
        taskId: row.id
      }).then(res => {
        if (res.code === "0") {
          this.$message({
            type: "success",
            message: "启动成功！"
          });
          this.handleRefresh();
        }
      });
    },
    //暂停
    handleRecovery(row) {
      this.$confirm("确定要暂停此任务吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          stopTask({ taskId: row.id }).then(res => {
            if (res.code === "0") {
              this.$message({
                type: "success",
                message: "暂停成功！"
              });
              this.handleRefresh();
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消！"
          });
        });
    },
    //取消
    handleCancel() {
      if ((this.dialogType = "log")) {
        this.dialogVisible = true;
      }
      this.dialogVisible = false;
      this.form = {
        name: "",
        description: "",
        invokeTarget: "",
        expression: "",
        remarks: ""
      };
      this.$refs.form.resetFields();
    },
    //确定
    handleDetermine() {
      if (this.form.remarks.trim().length > 200) {
        return this.message({
          type: "warning",
          message: "备注信息长度不能超过200位！"
        });
      }
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.dialogType == "add") {
            this.form.expression = this.form.expression.split("?")[0] + "?";
            console.log(this.form);
            taskSave(this.form).then(res => {
              if (res.code === "0") {
                this.$message({
                  type: "success",
                  message: "新增成功！"
                });
                this.handleCancel();
                this.handleRefresh();
              }
            });
          }
          if (this.dialogType == "edit") {
            // this.form.expression = this.form.expression.split('?')[0]+'?';
            let data = {
              ...this.form,
              id: this.updateId
            };
            taskUpdate(data).then(res => {
              if (res.code === "0") {
                this.$message({
                  type: "success",
                  message: "修改成功！"
                });
                this.handleCancel();
                this.handleRefresh();
              }
            });
          }
        }
      });
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.getTaskPage();
    },
    handleCurrentChange(val) {
      this.params.pageNo = val;
      this.getTaskPage();
    },
    //获取当前时间
    getCurrentDate() {
      var myDate = new Date();
      var year = myDate.getFullYear(); //年
      var month = this.formatterTime(myDate.getMonth() + 1); //月
      var day = this.formatterTime(myDate.getDate()); //日
      var hh = this.formatterTime(myDate.getHours()); //
      var mm = this.formatterTime(myDate.getMinutes()); //
      var ss = this.formatterTime(myDate.getSeconds()); //
      this.exeStartTime = `${year}-${month}-${day}  ${hh}:${mm}:${ss}`;
    },
    formatterTime(n) {
      if (n < 10) {
        return "0" + n;
      } else {
        return n;
      }
    }
  }
};
</script>
<style scoped >
.table_row /deep/ .el-button {
  font-size: 12px;
  padding: 5px;
}
.taskBox /deep/ .el-dialog__wrapper .el-dialog__header {
  background: #304156;
}
.taskBox /deep/ .el-dialog__wrapper .el-dialog__header span {
  color: #f4f4f4;
  font-size: 16px;
}
.taskBox /deep/ .el-dialog {
  border-radius: 5px;
  overflow: hidden;
  margin-top: 5vh !important;
}
.taskBox /deep/ .el-dialog .el-dialog__body {
  padding: 10px 20px;
}
.taskBox /deep/ .el-dialog .el-dialog__footer {
  padding: 10px 20px;
}

.taskBox {
  padding: 10px;
}
.taskBox .top {
  margin-bottom: 10px;
}
.search_col .el-input {
  width: 11%;
  margin-right: 15px;
  font-size: 12px;
}
.search_col .el-select {
  width: 10%;
  margin-right: 15px;
  font-size: 12px;
}
.search_col span {
  font-size: 14px;
}
.search_col /deep/ .el-input__inner {
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  padding: 0 5px !important;
}
.search_col /deep/ .el-input__icon {
  line-height: 32px;
}
.select_dept {
  width: 11% !important;
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

.taskBox .page {
  margin-top: 10px;
}

.text-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
