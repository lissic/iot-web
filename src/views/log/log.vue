<template>
  <div class="logBox">
    <el-row class="top">
      <el-col :span="24" class="search_col">
        <span>日志标题:</span>
        <el-input
          placeholder="请输入日志标题"
          @keyup.enter.native="handleSearch"
          v-model="searchTit"
          clearable
        ></el-input>
        <span>请求地址:</span>
        <el-input
          placeholder="请输入请求地址"
          @keyup.enter.native="handleSearch"
          v-model="searcUrl"
          clearable
        ></el-input>
        <span>业务类型:</span>
        <el-input
          placeholder="请输入业务类型"
          @keyup.enter.native="handleSearch"
          v-model="searcType"
          clearable
        ></el-input>
        <span>操作者:</span>
        <el-input
          placeholder="操作者"
          @keyup.enter.native="handleSearch"
          v-model="searchOper"
          clearable
        ></el-input>

        <el-button size="small" icon="el-icon-more" type="primary" @click="search_more">更多</el-button>
        <el-button size="small" icon="el-icon-search" type="primary" @click="handleSearch">搜索</el-button>
        <el-button size="small" icon="el-icon-refresh" type="primary" @click="handleRefresh">重置</el-button>
      </el-col>
      <transition name="el-fade-in-linear">
        <el-col :span="24" class="search_col2" style="margin-top:10px;" v-show="showMore">
          <span>是否异常:</span>
          <el-select
            class="selectExce"
            @keyup.enter.native="handleSearch"
            v-model="searchExce"
            placeholder="请选择是否异常"
            clearable
          >
            <el-option label="是" :value="1"></el-option>
            <el-option label="否" :value="0"></el-option>
          </el-select>
          <span>时间:</span>
          <el-date-picker
            class="timerInput"
            v-model="execStartTime"
            type="datetime"
            placeholder="操作开始时间"
          ></el-date-picker>-
          <el-date-picker
            class="timerInput"
            v-model="execEndTime"
            type="datetime"
            placeholder="操作结束时间"
          ></el-date-picker>
        </el-col>
      </transition>
    </el-row>

    <el-row class="table_row">
      <el-table :data="loglist" stripe border v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="日志标题">
          <template slot-scope="scope">
            <span class="logName" @click="handleDetails(scope.row)">{{scope.row.title}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="requestUrl" label="请求地址"></el-table-column>
        <el-table-column prop="bizType" label="业务类型"></el-table-column>
        <el-table-column prop="operator" label="操作者"></el-table-column>
        <el-table-column prop="isException" label="是否异常">
          <template slot-scope="scope">
            <span
              :class=" scope.row.isException == 0 ? '':'red' "
            >{{ scope.row.isException == 0 ? '否':'是' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="操作时间"></el-table-column>
        <el-table-column prop="executeTime" label="执行时间">
          <template slot-scope="scope">{{ scope.row.executeTime }} ms</template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-row class="page">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
        :current-page="listData.pageNo"
        :page-sizes="[10, 20, 30]"
        :page-size="listData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-row>

    <el-drawer
      :size=" '30%' "
      class="detail_drawer"
      title="日志详情"
      :visible.sync="drawer"
      direction="rtl"
    >
      <el-form :model="logDetails">
        <el-row class="border" :gutter="10">
          <el-col :span="24">
            <el-form-item label="日志名称:">
              <span>{{ logDetails.title }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="业务类型:">
              <span>{{ logDetails.bizType }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作者:">
              <span>{{ logDetails.operator }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否异常:">
              <span>{{ logDetails.isException == 0 ? '否':'是' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求地址:">
              <span>{{ logDetails.requestUrl }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作内容:">
              <span>{{ logDetails.content }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="执行时间:">
              <span>{{ logDetails.executeTime }} ms</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作时间:">
              <span>{{ logDetails.createTime }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-drawer>
  </div>
</template>
<script>
import { logPage } from "@/api/log";
import moment from "moment";
export default {
  data() {
    return {
      loglist: [],
      loading: false,
      current: 1,
      size: 10,
      total: 0,
      searchTit: "",
      searcUrl: "",
      searcType: "",
      searchOper: "",
      searchExce: null,
      listData: {
        title: "",
        requestUrl: "",
        bizType: "",
        operator: "",
        isException: 0,
        execStartTime: "",
        execEndTime: "",
        pageNo: 1,
        pageSize: 10
      },
      execStartTime: "",
      execEndTime: "",
      showMore: false,
      drawer: false,
      logDetails: {}
    };
  },
  created() {
    this.getLogList();
  },
  methods: {
    getLogList() {
      this.loading = true;
      logPage(this.listData)
        .then(res => {
          if (res.code == 0) {
            this.loading = false;
            this.loglist = res.data.list;
            this.total = res.data.total;
            this.current = res.data.current;
            this.size = res.data.size;
          }
        })
        .catch(e => {
          this.loading = false;
        });
    },
    handleSearch() {
      this.listData.title = this.searchTit;
      this.listData.bizType = this.searcType;
      this.listData.operator = this.searchOper;
      this.listData.isException = this.searchExce;
      this.listData.requestUrl = this.searcUrl;
      this.listData.pageNo = 1;

      if (this.execStartTime != "" && this.execEndTime != "") {
        this.listData.execStartTime = moment(this.execStartTime).format(
          "YYYY-MM-DD HH:mm:ss "
        );
        this.listData.execEndTime = moment(this.execEndTime).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      } else {
        this.listData.execStartTime = "";
        this.listData.execEndTime = "";
      }
      if (this.execStartTime != "" && this.execEndTime == "") {
        return this.$message({
          type: "warning",
          message: "请选择操作结束时间！"
        });
      }
      if (this.execEndTime != "" && this.execStartTime == "") {
        return this.$message({
          type: "warning",
          message: "请选择操作开始时间！"
        });
      }
      if (
        parseInt(new Date(this.execStartTime).getTime()) >
        parseInt(new Date(this.execEndTime).getTime())
      ) {
        return this.$message({
          type: "warning",
          message: "开始时间不能大于结束时间！"
        });
      }

      this.getLogList();
    },
    //每页条数发生变化
    handleSizeChange(val) {
      this.listData.pageSize = val;
      this.getLogList();
    },
    //页码发生变化
    handleCurrentChange(val) {
      this.listData.pageNo = val;
      this.getLogList();
    },
    search_more() {
      this.showMore = !this.showMore;
    },
    handleRefresh() {
      this.searchTit = this.searcUrl = this.searcType = this.searchOper = this.execStartTime = this.execEndTime =
        "";
      this.searchExce = null;
      this.showMore = false;
      this.listData = {
        title: "",
        requestUrl: "",
        bizType: "",
        operator: "",
        isException: 0,
        execStartTime: "",
        execEndTime: "",
        pageNo: 1,
        pageSize: 10
      };
      this.getLogList();
    },
    handleDetails(row) {
      this.drawer = true;
      this.logDetails = row;
    }
  }
};
</script>
<style scoped>
.red {
  color: red;
}
/* .el-button{
        font-size: 12px;
        padding: 6px;
    } */
.logBox {
  padding: 10px;
}
.logBox .top {
  margin-bottom: 10px;
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
.logBox .page {
  margin-top: 10px;
}

.search_col .el-input {
  width: 11%;
  margin-right: 20px;
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
.search_col2 /deep/ .el-input__icon {
  line-height: 32px;
}
.search_col2 span {
  font-size: 14px;
}
.search_col2 /deep/ .el-input__inner {
  height: 32px;
  line-height: 32px;
  font-size: 12px;
}

.search_col2 /deep/ .selectExce {
  width: 11%;
  margin-right: 20px;
  font-size: 12px;
}
.selectExce /deep/ .el-input__inner {
  padding: 0 5px 0 5px !important;
}
.timerInput {
  width: 18%;
}

.logName {
  color: #2a80eb;
  cursor: pointer;
  text-decoration: underline;
}
.logName:hover {
  color: blue;
}
.detail_drawer >>> .el-drawer__header {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}
.detail_drawer >>> .el-drawer__body {
  padding: 0px 20px;
}
</style>