<template>
  <div class="clearBox">
    <el-row class="top">
      <el-col :span="24" class="search_col">
        <span>设备ID：</span>
        <el-input
          v-model="params.deviceId"
          placeholder="请输入设备ID"
          clearable
          @keyup.enter.native="handleSearch"
        />
        <span>策略名称：</span>
        <el-input
          v-model="params.alarmStrategyName"
          placeholder="请输入策略名称"
          clearable
          @keyup.enter.native="handleSearch"
        />
        <span>告警状态：</span>
        <el-select v-model="params.status" clearable @keyup.enter.native="handleSearch">
          <el-option label="未处理" :value="0" />
          <el-option label="已处理" :value="1" />
        </el-select>

        <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="handleRefresh">重置</el-button>
      </el-col>
    </el-row>

    <!-- stripe -->
    <el-row class="table_row">
      <el-table
        v-loading="loading"
        border
        style="width: 100%"
        :data="tableData"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="alarmObject" label="告警对象" />
        <el-table-column prop="alarmStrategyName" label="告警策略名称" />
        <el-table-column prop="deviceId" label="设备ID" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="alarmVal" label="告警值" />
        <el-table-column prop="alarmLevel" label="告警级别">
          <template slot-scope="scope">
            <span v-show="scope.row.alarmLevel ==0" class="blue">轻度告警</span>
            <span v-show="scope.row.alarmLevel ==1" class="yellow">一般告警</span>
            <span v-show="scope.row.alarmLevel ==2" class="orange">中度告警</span>
            <span v-show="scope.row.alarmLevel ==3" class="red">严重告警</span>
          </template>
        </el-table-column>
        <el-table-column prop="alarmType" label="告警类型">
          <template slot-scope="scope">
            <span v-if="scope.row.alarmType===0">系统告警</span>
            <span v-else>设备告警</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="告警状态">
          <template slot-scope="scope">
            <span v-if="scope.row.status===0" style="color:red;">未处理</span>
            <span v-else style="color:green;">已处理</span>
          </template>
        </el-table-column>
        <el-table-column prop="alarmTime" width="140" label="告警时间" />

        <el-table-column prop="address" width="150" label="操作">
          <template slot-scope="scope">
            <el-button
              v-show="scope.row.status===0"
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="handleStatus(scope.row)"
            >处理</el-button>
            <el-button
              type="info"
              icon="el-icon-document-copy"
              size="mini"
              @click="handleDetail(scope.row)"
            >详情</el-button>
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
      :before-close="handleCancel"
    >
      <div v-show="dialogType=='edit' ">
        <el-form ref="form" :rules="formRule" :model="form" label-width="90px">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="处理结果:" prop="handleRes">
                <el-input v-model="form.handleRes" type="textarea" placeholder="请输入处理结果" />
                <div>提示：不能超过200个字符！</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button v-show="dialogType=='edit' " @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleDetermine">确 定</el-button>
      </span>
    </el-dialog>

    <el-drawer class="detail_drawer" title="详情 " :visible.sync="drawer" direction="rtl">
      <div class="drawer_content">
        <el-form :model="detailsData">
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="告警对象:">
                <span>{{ detailsData.alarmObject }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="告警策略名称:">
                <span>{{ detailsData.alarmStrategyName }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="设备ID:">
                <span>{{ detailsData.deviceId }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="设备名称:">
                <span>{{ detailsData.deviceName }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="告警值:">
                <span>{{ detailsData.alarmVal }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="告警类型:">
                <span v-show="detailsData.alarmType ==0">系统告警</span>
                <span v-show="detailsData.alarmType ==1">设备告警</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="告警级别:">
                <span v-show="detailsData.alarmLevel ==0">轻度告警</span>
                <span v-show="detailsData.alarmLevel ==1">一般告警</span>
                <span v-show="detailsData.alarmLevel ==2">中度告警</span>
                <span v-show="detailsData.alarmLevel ==3">严重告警</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="告警状态:">
                <span v-show="detailsData.status==0">未处理</span>
                <span v-show="detailsData.status==1">未处理</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="告警时间:">
                <span>{{ detailsData.alarmTime }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="标准值:">
                <span>{{ detailsData.standardVal }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="阈值:">
                <span>{{ detailsData.thresholdVal }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="border" :gutter="10">
            <el-col :span="24">
              <el-form-item label="处理结果:">
                <span>{{ detailsData.handleRes }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>
<script>
// 告警级别 0-轻度告警;1-一般告警;2-中度告警;3-严重告警
import { alarmPage, alarmUpdateStatus, alarmDetails } from "@/api/sys";
export default {
  name: "AlarmClear",
  data() {
    return {
      searchID: "",
      searchType: "",
      searchStatus: "",
      searchName: "",
      params: {
        alarmType: 0,
        status: "",
        deviceId: "",
        alarmStrategyName: "",
        pageNo: 1,
        pageSize: 10
      },
      total: 0,
      loading: false,
      tableData: [],
      dialogTitle: "详情",
      dialogVisible: false,
      dialogType: "edit", // 弹框类型
      form: {
        alarmId: "",
        status: 0,
        handleRes: ""
      },
      formRule: {
        // 表单验证规则
        handleRes: [
          { required: true, message: "请输入处理结果！", trigger: "blur" },
          {
            required: true,
            max: 200,
            message: "格式有误，处理结果长度不能超过200位！",
            trigger: "blur"
          }
        ]
      },
      detailsData: {},
      drawer: false,
      handleFinish: false, //处理完
      routeId: ""
    };
  },
  created() {
    this.getPageList();
  },
  mounted() {
    if (this.$route.query.id) {
      this.routeId = this.$route.query.id;
    }
  },
  watch: {
    $route: {
      handler() {
        this.routeId = this.$route.query.id;
      },
      deep: true
    }
  },
  methods: {
    getPageList() {
      this.loading = true;
      alarmPage(this.params)
        .then(res => {
          if (res.code === "0") {
            this.loading = false;
            this.tableData = res.data.list;
            this.total = res.data.total;
          }
        })
        .catch(e => {
          this.loading = false;
        });
    },
    //某一行高亮
    tableRowClassName({ row }) {
      if (row.id === this.routeId) {
        if (this.handleFinish === false) {
          return "warning-row";
        } else {
          return "";
        }
      }
    },

    // 搜索
    handleSearch() {
      this.params.pageNo = 1;
      this.getPageList();
    },
    // 重置
    handleRefresh() {
      this.params = {
        alarmType: 0,
        status: "",
        deviceId: "",
        alarmStrategyName: "",
        pageNo: 1,
        pageSize: 10
      };
      this.routeId = "";
      this.getPageList();
    },
    // 详情
    handleDetail(row) {
      this.drawer = true;
      alarmDetails(row.id).then(res => {
        if (res.code === "0") {
          this.detailsData = res.data;
        }
      });
    },
    // c处理
    handleStatus(row) {
      this.form.alarmId = row.id;
      this.form.status = 1;
      this.dialogVisible = true;
      this.dialogType = "edit";
      this.dialogTitle = "处理";
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.getPageList();
    },
    handleCurrentChange(val) {
      this.params.pageNo = val;
      this.getPageList();
    },
    // 取消
    handleCancel() {
      this.form = {
        alarmId: "",
        status: 0,
        handleRes: ""
      };
      this.dialogVisible = false;
      this.$refs.form.resetFields();
    },
    // 确定
    handleDetermine() {
      if (this.dialogType == "edit") {
        this.$refs.form.validate(valid => {
          if (valid) {
            alarmUpdateStatus(this.form).then(res => {
              if (res.code === "0") {
                this.$message({
                  type: "success",
                  message: "处理成功！"
                });
                this.handleFinish = true;
                this.handleCancel();
                this.handleRefresh();
              }
            });
          }
        });
      }
    }
  }
};
</script>
<style scoped>
.table_row /deep/ .el-button {
  font-size: 12px;
  padding: 5px;
}
.clearBox {
  padding: 10px;
}
.clearBox .top {
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

.clearBox .page {
  margin-top: 10px;
}

.clearBox /deep/ .el-dialog__wrapper .el-dialog__header {
  background: #304156;
}
.clearBox /deep/ .el-dialog__wrapper .el-dialog__header span {
  color: #f4f4f4;
  font-size: 16px;
}
.clearBox /deep/ .el-dialog {
  border-radius: 5px;
  overflow: hidden;
}

.detail_drawer >>> .el-drawer__header {
  background: #304156;
  padding: 10px;
  color: #f4f4f4;
  font-size: 16px;
  margin-bottom: 0px;
}
.detail_drawer >>> .el-form-item {
  margin-bottom: 0px;
}
.detail_drawer >>> .el-form-item .el-form-item__label {
  font-size: 12px;
}
.drawer_content {
  padding: 15px;
}
.border {
  border: 1px dashed #ccc;
}

.red {
  color: red;
}
.orange {
  color: orange;
}
.yellow {
  color: yellow;
}
.blue {
  color: blue;
}

.table_row /deep/ .warning-row {
  background: #f89a9a;
}
</style>
