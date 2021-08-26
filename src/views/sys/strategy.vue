<template>
  <div class="alarm_strategy_box">
    <el-row>
      <el-col :span="5">
        <span class="search_font">名称：</span>
        <el-input
          size="small"
          v-model="strategyName"
          @keyup.enter.native="queryStrategy"
          placeholder="请输入内容"
          clearable
        />
      </el-col>
      <el-col :span="5">
        <span class="search_font">类型：</span>
        <el-select
          v-model="strategyType"
          class="role-select"
          @keyup.enter.native="queryStrategy"
          placeholder="请选择"
          size="small"
          clearable
        >
          <el-option label="主动上报" :value="0" />
          <el-option label="被动监控" :value="1" />
        </el-select>
      </el-col>
      <el-col :span="5">
        <span class="search_font">级别：</span>
        <el-select
          v-model="strategyLevel"
          class="role-select"
          @keyup.enter.native="queryStrategy"
          placeholder="请选择"
          size="small"
          clearable
        >
          <el-option label="非告警" :value="0" />
          <el-option label="一般告警" :value="1" />
          <el-option label="中度告警" :value="2" />
          <el-option label="严重告警" :value="3" />
        </el-select>
      </el-col>
      <el-col :span="9">
        <el-button size="small" icon="el-icon-more" @click="showMore = !showMore">更多</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="handleSearch">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-search" @click="resetParam">重置</el-button>
        <el-button
          v-if="isAdminRole == true"
          size="small"
          type="success"
          icon="el-icon-circle-plus-outline"
          @click="saveStrategy"
        >新增</el-button>
        <el-button v-if="isAdminRole == true" size="small" type="danger" :disabled="delFlag" @click="delStrategy()">删除</el-button>
      </el-col>
    </el-row>
    <el-collapse-transition>
      <el-row class="alarm_strategy_col" v-show="showMore">
        <el-col :span="5">
          <span class="search_font">是否启用：</span>
          <el-select
            v-model="strategyStatus"
            class="role-select"
            @keyup.enter.native="queryStrategy"
            placeholder="请选择"
            size="small"
            clearable
          >
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-col>
        <el-col :span="7">
          <span class="search_font">描述：</span>
          <el-input
            size="small"
            v-model="strategyDesc"
            @keyup.enter.native="queryStrategy"
            placeholder="请输入内容"
            clearable
          />
        </el-col>
      </el-row>
    </el-collapse-transition>
    <el-row class="table_row">
      <el-table
        border
        :header-cell-style="{background:'#304156',color:'#c8d1db'}"
        ref="multipleTable"
        v-loading="loading"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 98%; margin-right: 10px;margin-top: 10px;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" label="策略名称" width="200"></el-table-column>
        <el-table-column prop="type" label="策略类型" width="150">
          <template slot-scope="scope">{{scope.row.type|getStrategyType}}</template>
        </el-table-column>
        <el-table-column prop="alarmLevel" label="告警级别">
          <template slot-scope="scope">{{scope.row.alarmLevel|getStrategyLevel}}</template>
        </el-table-column>
        <el-table-column prop="alarmMethod" label="告警方式">
          <template slot-scope="scope">{{scope.row.alarmMethod|getStrategyMethod}}</template>
        </el-table-column>
        <el-table-column prop="alarmItems" label="告警项" width="300">
          <template slot-scope="scope">{{scope.row.itemNameList}}</template>
        </el-table-column>
        <el-table-column prop="alarmRule" label="告警规则">
          <template slot-scope="scope">{{scope.row.alarmRule|getStrategyRule}}</template>
        </el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="status" label="是否启用">
          <el-switch
            v-if="isAdminRole == true"
            v-model="scope.row.status"
            slot-scope="scope"
            class="switch"
            active-color="#13ce66"
            inactive-color="#89929AFF"
            :active-value="true"
            :inactive-value="false"
            active-text="是"
            inactive-text="否"
            @change="disableStrategy(scope.row)"
          />
          <el-switch
            v-else
            disabled
            v-model="scope.row.status"
            slot-scope="scope"
            class="switch"
            active-color="#13ce66"
            inactive-color="#89929AFF"
            :active-value="true"
            :inactive-value="false"
            active-text="是"
            inactive-text="否"
            @change="disableStrategy(scope.row)"
          />
        </el-table-column>
        <el-table-column label="操作" width="200" v-if="showOperation">
          <template slot-scope="scope">
            <el-button
              v-if="isAdminRole == true"
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="editStrategy(scope.row)"
            >修改</el-button>
            <el-button
              v-if="isAdminRole == true"
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="delStrategy([scope.row.id])"
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
        style="margin-top: 5px;"
      />
    </el-row>
    <el-dialog
      width="70%"
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :before-close="cancelSave"
    >
      <el-form ref="form" :model="form" :rules="formRule">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item size="small" label="策略名称:" prop="name">
              <el-input size="small" v-model="form.name" placeholder="请输入内容" style="width: 68%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item size="small" label="策略类型:" prop="type">
              <el-select
                v-model="form.type"
                class="role-select"
                placeholder="请选择"
                size="small"
                clearable
              >
                <el-option label="主动上报" :value="0" />
                <el-option label="被动监控" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item size="small" label="是否启用:" prop="status">
              <el-select
                v-model="form.status"
                class="role-select"
                placeholder="请选择"
                size="small"
                clearable
              >
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-left: 0px;">
          <el-col :span="8">
            <el-form-item size="small" label="告警级别:" prop="level">
              <el-select
                v-model="form.level"
                class="role-select"
                placeholder="请选择"
                size="small"
                clearable
              >
                <el-option label="非告警" :value="0" />
                <el-option label="一般告警" :value="1" />
                <el-option label="中度告警" :value="2" />
                <el-option label="严重告警" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item size="small" label="告警规则:" prop="rule">
              <el-select
                v-model="form.rule"
                class="role-select"
                placeholder="请选择"
                size="small"
                clearable
              >
                <el-option label="时间间隔" :value="1" />
                <el-option label="重复次数" :value="0" />
              </el-select>
              <el-input-number
                size="small"
                controls-position="right"
                v-model="form.repeatTime"
                :min="1"
                :max="10"
                style="margin-left: 6%;"
              />
              <b>分钟/次数</b>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-left: 0px;">
          <el-col :span="24">
            <el-form-item label="告警方式:" prop="method">
              <el-checkbox-group v-model="form.method">
                <el-checkbox label="0">不告警</el-checkbox>
                <el-checkbox label="1">弹窗告警</el-checkbox>
                <el-checkbox label="2">声音告警</el-checkbox>
                <el-checkbox label="3">APP告警</el-checkbox>
                <el-checkbox label="4">短信告警</el-checkbox>
                <el-checkbox label="5">邮件告警</el-checkbox>
                <el-checkbox label="6">电话告警</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-left: 0px;">
          <el-col :span="24">
            <el-form-item label="描述:" prop="desc">
              <el-input type="textarea" v-model="form.desc" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-left: 0px;">
          <el-col :span="24">
            <el-form-item label="告警项:" prop="items">
              <el-table
                border
                ref="multipleItemTable"
                :data="form.items"
                row-key="id"
                tooltip-effect="dark"
                @selection-change="handleSelectionItemChange"
              >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="itemName" label="告警项名称" width="120"></el-table-column>
                <el-table-column prop="itemCode" label="告警项编码" width="120"></el-table-column>
                <el-table-column prop="standardVal" label="标准值"></el-table-column>
                <el-table-column prop="thresholdVal" label="阈值"></el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
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
  delAlarmStrategy,
  getAlarmItemList,
  getAlarmStrategyPage,
  saveAlarmStrategy,
  updateAlarmStrategy
} from "@/api/alarm";
import { getInfo } from '@/api/user'

export default {
  data() {
    return {
      isAdminRole:false,
      showOperation:false,
      showMore: false,
      strategyId: "",
      strategyName: "",
      strategyDesc: "",
      strategyType: "",
      strategyLevel: "",
      strategyMethod: "",
      strategyStatus: "",
      tableData: [],
      userInfo:[],
      multipleSelection: [],
      multipleItemSelection: [],
      current: 1,
      size: 10,
      total: 0,
      form: {
        name: "",
        type: 0,
        status: 1,
        level: 0,
        desc: "",
        items: [],
        repeatTime: "",
        repeatNum: 0,
        rule: 1,
        method: []
      },
      dialogType: "add",
      dialogTitle: "新增告警策略",
      dialogVisible: false,
      formRule: {
        // 表单验证规则
        name: {
          required: true,
          message: "请输入告警项名称！",
          trigger: "blur"
        },
        type: {
          required: true,
          message: "请输入告警项编码！",
          trigger: "blur"
        },
        level: { required: true, message: "请输入告警级别！", trigger: "blur" },
        method: {
          required: true,
          message: "请输入告警方式！",
          trigger: "change"
        },
        rule: { required: true, message: "请输入告警规则！", trigger: "blur" }
      },
      loading: false,
      alarmMethods: new Map([
        [0, "不告警"],
        [1, "弹窗告警"],
        [2, "声音告警"],
        [3, "APP告警"],
        [4, "短信告警"],
        [5, "邮件告警"],
        [6, "电话告警"],
        [99, "其他"]
      ])
    };
  },
  created() {
    this.getUserInfo();
    this.queryStrategy();
  },
  filters: {
    getStrategyType(key) {
      const typeMap = new Map([
        [0, "主动上报"],
        [1, "被动监控"]
      ]);
      return typeMap.get(key);
    },
    getStrategyStatus(key) {
      const typeMap = new Map([
        [0, "否"],
        [1, "是"]
      ]);
      return typeMap.get(key);
    },
    getStrategyLevel(key) {
      const typeMap = new Map([
        [0, "轻度告警"],
        [1, "一般告警"],
        [2, "中度告警"],
        [3, "严重告警"]
      ]);
      return typeMap.get(key);
    },
    getStrategyMethod(key) {
      let method = "[";
      const methods = key.split(",");
      console.log(methods);
      const typeMap = new Map([
        ["0", "不告警"],
        ["1", "弹窗告警"],
        ["2", "声音告警"],
        ["3", "APP告警"],
        ["4", "短信告警"],
        ["5", "邮件告警"],
        ["6", "电话告警"],
        ["99", "其他"]
      ]);
      for (let i = 0; i < methods.length; i++) {
        method = method + typeMap.get(methods[i]) + ",";
      }
      method = method.substr(0, method.length - 1);
      method += "]";
      return method;
    },
    getStrategyRule(key) {
      const typeMap = new Map([
        [0, "重复次数"],
        [1, "时间间隔"]
      ]);
      return typeMap.get(key);
    }
  },
  computed: {
    delFlag() {
      // 禁用删除按钮
      return this.multipleSelection.length <= 0;
    }
  },
  methods: {
    queryStrategy() {
      this.loading = true;
      let data = {
        name: this.strategyName,
        type: this.strategyType,
        alarmLevel: this.strategyLevel,
        description: this.strategyDesc,
        status: this.strategyStatus,
        pageNo: this.current,
        pageSize: this.size
      };
      getAlarmStrategyPage(data)
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
      let data = {
        name: this.strategyName,
        type: this.strategyType,
        alarmLevel: this.strategyLevel,
        description: this.strategyDesc,
        status: this.strategyStatus,
        pageSize: this.size
      };
      getAlarmStrategyPage(data)
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
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleSelectionItemChange(val) {
      this.multipleItemSelection = val;
    },
    handleSizeChange(val) {
      this.size = val;
      this.queryStrategy();
    },
    handleCurrentChange(val) {
      this.current = val;
      this.queryStrategy();
    },
    cancelSave() {
      this.$refs["form"].resetFields();
      this.dialogVisible = false;
    },
    saveStrategy() {
      this.dialogTitle = "新增告警策略";
      this.dialogType = "add";
      this.dialogVisible = true;
      this.queryItemList([]);
      this.form = {
        name: "",
        type: 0,
        status: 1,
        level: 0,
        desc: "",
        items: [],
        repeatTime: "",
        repeatNum: 0,
        rule: 1,
        method: []
      };
    },
    editStrategy(row) {
      this.queryItemList(row.alarmItems.split(","));
      this.dialogVisible = true;
      this.dialogType = "update";
      this.dialogTitle = "更新告警策略";
      this.strategyId = row.id;
      this.form.name = row.name;
      this.form.type = row.type;
      this.form.rule = row.alarmRule;
      this.form.status = row.status ? 1 : 0;
      this.form.level = row.alarmLevel;
      this.form.desc = row.description;
      this.form.repeatTime = row.alarmRepeatTime;
      this.form.repeatNum = row.alarmRepeatNum;
      this.form.method = row.alarmMethod.split(",");
    },
    delStrategy(ids) {
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
        delAlarmStrategy({ ids: param }).then(res => {
          if (res.code === "0") {
            this.$message({
              type: "success",
              message: "删除成功！"
            });
            this.queryStrategy();
          } else {
            this.$message({
              type: "error",
              message: "删除失败！"
            });
          }
        });
      });
    },
    submitSave() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          const items = [];
          this.multipleItemSelection.forEach(item => {
            items.push(item.id);
          });
          if (this.dialogType === "add") {
            saveAlarmStrategy({
              name: this.form.name,
              type: this.form.type,
              status: this.form.status,
              alarmLevel: this.form.level,
              alarmMethod: this.form.method.join(","),
              description: this.form.desc,
              alarmItems: items.toString(),
              alarmRule: this.form.rule,
              alarmRepeatTime:
                this.form.rule === 1 ? this.form.repeatTime : null,
              alarmRepeatNum: this.form.rule === 0 ? this.form.repeatTime : null
            }).then(res => {
              if (res.code === "0") {
                this.$message({
                  type: "success",
                  message: "新增成功！"
                });
                this.dialogVisible = false;
                this.queryStrategy();
              } else {
                this.$message({
                  type: "error",
                  message: "新增失败！"
                });
                this.dialogVisible = false;
              }
            });
          }
          if (this.dialogType === "update") {
            updateAlarmStrategy({
              id: this.strategyId,
              name: this.form.name,
              type: this.form.type,
              status: this.form.status,
              alarmLevel: this.form.level,
              alarmMethod: this.form.method.join(","),
              description: this.form.desc,
              alarmItems: items.toString(),
              alarmRule: this.form.rule,
              alarmRepeatTime:
                this.form.rule === 1 ? this.form.repeatTime : null,
              alarmRepeatNum: this.form.rule === 0 ? this.form.repeatTime : null
            }).then(res => {
              if (res.code === "0") {
                this.$message({
                  type: "success",
                  message: "更新成功！"
                });
                this.dialogVisible = false;
                this.queryStrategy();
              } else {
                this.$message({
                  type: "error",
                  message: "更新失败！"
                });
                this.dialogVisible = false;
              }
            });
          }
        }
      });
    },
    queryItemList(selectedNode) {
      getAlarmItemList({}).then(res => {
        if (res.code === "0") {
          this.loading = false;
          this.form.items = res.data;
          this.$nextTick(() => {
            this.form.items.forEach(item => {
              if (
                selectedNode.length !== 0 &&
                selectedNode.indexOf(item.id) > -1
              ) {
                this.$refs.multipleItemTable.toggleRowSelection(item, true);
              }
            });
          });
        } else {
          this.$message({
            type: "error",
            message: "查询失败！"
          });
        }
      });
    },
    disableStrategy(row) {
      updateAlarmStrategy({
        id: row.id,
        status: row.status
      }).then(res => {
        if (row.status === true && res.code === "0") {
          this.$message({
            type: "success",
            message: "启用成功！"
          });
        } else {
          this.$message({
            type: "warning",
            message: "禁用成功！"
          });
        }
      });
    },
    resetParam() {
      this.strategyName = "";
      this.strategyType = "";
      this.strategyLevel = "";
      this.strategyMethod = "";
      this.strategyDesc = "";
      this.strategyStatus = "";
      this.current = 1;
      this.size = 10;
      this.queryStrategy();
    }
  }
};
</script>
<style scoped>
.search_font {
  font-size: 14px;
}
.alarm_strategy_box {
  margin: 10px;
}
.alarm_strategy_box .el-input {
  width: 70%;
  margin-right: 2%;
  margin-top: 2px;
}
.alarm_strategy_box .el-select {
  margin-right: 2%;
}
.alarm_strategy_col .el-select {
  margin-top: 10px;
}
.alarm_strategy_col .el-input {
  width: 70%;
  margin-top: 10px;
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
/* switch按钮样式 */
.alarm_strategy_box /deep/.switch .el-switch__label {
  position: absolute;
  display: none;
  color: #fff !important;
}
/*关闭时文字位置设置*/
.alarm_strategy_box /deep/.switch .el-switch__label--left {
  z-index: 1;
}
/* 调整关闭时文字的显示位子 */
.alarm_strategy_box /deep/.switch .el-switch__label--left span {
  margin-left: 19px;
}
/*显示文字*/
.alarm_strategy_box /deep/.switch .el-switch__label.is-active {
  display: block;
}
/* 调整按钮的宽度 */
.alarm_strategy_box /deep/.switch.el-switch .el-switch__core,
.el-switch .el-switch__label {
  width: 45px !important;
  margin: 0;
}
</style>
