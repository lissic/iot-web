<template>
  <div class="batteryBox">
    <el-row class="top">
      <el-col :span="24" class="search_col">
        <span>电池组名称：</span>
        <el-input v-model="params.name" clearable @keyup.enter.native="handleSearch" />
        <span>电池组序号：</span>
        <el-input v-model="params.groupId" clearable @keyup.enter.native="handleSearch" />
        <span>电池类型：</span>
        <el-select v-model="params.type" clearable>
          <el-option label="铅酸蓄电池" :value="0" />
          <el-option label="UPS" :value="1" />
          <el-option label="磷酸铁锂蓄电池" :value="2" />
          <el-option label="超级蓄电池" :value="3" />
          <el-option label="其他" :value="99" />
        </el-select>
        <span>电池状态：</span>
        <el-select v-model="params.status" clearable>
          <el-option label="监控中" :value="0" />
          <el-option label="无效" :value="1" />
          <el-option label="其他" :value="99" />
        </el-select>

        <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="handleRefresh">重置</el-button>
        <el-button
          size="small"
          type="success"
          icon="el-icon-circle-plus-outline"
          title="添加电池组"
          @click="addBatteryPack"
        >新增</el-button>
        <el-button size="small" type="success" icon="el-icon-arrow-left" @click="goback">返回</el-button>
      </el-col>
    </el-row>

    <el-row class="table_row">
      <el-table
        v-loading="loading"
        class="batteryBox"
        stripe
        border
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="name" label="电池组名称">
          <template slot-scope="scope">
            <span class="devicesName" @click="batteryGroup_details(scope.row)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="groupId" label="电池组序号" />
        <el-table-column prop="brand" label="品牌" />
        <el-table-column prop="manufacturer" label="制造商" />
        <el-table-column prop="model" label="型号" />
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <span v-show="scope.row.status==0">监控中</span>
            <span v-show="scope.row.status==1">无效</span>
            <span v-show="scope.row.status==99">其他</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型">
          <template slot-scope="scope">
            <span v-show="scope.row.type==0">铅酸蓄电池</span>
            <span v-show="scope.row.type==1">UPS</span>
            <span v-show="scope.row.type==2">磷酸铁锂蓄电池</span>
            <span v-show="scope.row.type==3">超级蓄电池</span>
            <span v-show="scope.row.type==99">其他</span>
          </template>
        </el-table-column>
        <el-table-column prop="batteryNum" label="电池数量" />
        <el-table-column prop="batchNum" label="生产批号" />
        <el-table-column width="150" prop="installTime" label="安装时间" />
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              type="success"
              icon="el-icon-circle-plus-outline"
              size="mini"
              title="电池信息"
              @click="addBattery(scope.row)"
            />
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              title="修改"
              @click="modify(scope.row)"
            />
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除"
              @click="deleteBatteryGroup(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogBatteryPack"
      width="50%"
      :before-close="handleCancel_bp"
    >
      <el-form
        v-show="dialogType != 'details' "
        ref="form_batteryPack"
        :rules="formRule"
        :model="form_batteryPack"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电池组名称:" prop="name">
              <el-input v-model="form_batteryPack.name" placeholder="请输入电池组名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电池组序号:" prop="groupId">
              <el-input v-model="form_batteryPack.groupId" placeholder="请输入电池组序号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌:" prop="brand">
              <el-input v-model="form_batteryPack.brand" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="制造商:" prop="manufacturer">
              <el-input v-model="form_batteryPack.manufacturer" placeholder="请输入制造商" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型:">
              <el-select v-model="form_batteryPack.type">
                <el-option label="铅酸蓄电池" :value="0" />
                <el-option label="UPS" :value="1" />
                <el-option label="磷酸铁锂蓄电池" :value="2" />
                <el-option label="超级蓄电池" :value="3" />
                <el-option label="其他" :value="99" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电池组型号:" prop="model">
              <el-input v-model="form_batteryPack.model" placeholder="电池组型号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电池个数:" prop="batteryNum">
              <el-input
                v-model="form_batteryPack.batteryNum"
                class="input-w"
                type="number"
                min="0"
                placeholder="电池个数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产批号:" prop="batchNum">
              <el-input v-model="form_batteryPack.batchNum" placeholder="生产批号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装时间:">
              <el-date-picker
                v-model="form_batteryPack.installTime"
                type="datetime"
                placeholder="选择日期时间"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注:" prop="remarks">
              <el-input v-model="form_batteryPack.remarks" type="textarea" placeholder="备注" />
              <div>提示：长度不能超过200位！</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-form v-show="dialogType == 'details' " :model="bg_details" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电池组名称:" prop="name">
              <span>{{ bg_details.name }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电池组序号:" prop="groupId">
              <span>{{ bg_details.groupId }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌:">
              <span>{{ bg_details.brand }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="制造商:">
              <span>{{ bg_details.manufacturer }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电池组型号:" prop="model">
              <span>{{ bg_details.model }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电池个数:">
              <span>{{ bg_details.batteryNum }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产批号:" prop="batchNum">
              <span>{{ bg_details.batchNum }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装时间:">
              <span>{{ bg_details.installTime }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态:">
              <span v-show="bg_details.status==0">监控中</span>
              <span v-show="bg_details.status==1">无效</span>
              <span v-show="bg_details.status==99">其他</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型:">
              <span v-show="bg_details.type==0">铅酸蓄电池</span>
              <span v-show="bg_details.type==1">UPS</span>
              <span v-show="bg_details.type==2">磷酸铁锂蓄电池</span>
              <span v-show="bg_details.type==3">超级蓄电池</span>
              <span v-show="bg_details.type==99">其他</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注:">
              <span>{{ bg_details.remarks }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button v-show="dialogType != 'details' " @click="handleCancel_bp">取 消</el-button>
        <el-button type="primary" @click="handleDetermine_bp">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="dialogTitle_b"
      :visible.sync="dialogBattery"
      width="55%"
      :before-close="handleCancel_b"
    >
      <div>
        <el-button
          class="addBattery-btn"
          size="small"
          type="success"
          icon="el-icon-circle-plus-outline"
          title="添加电池"
          @click="addBatteryItem"
        >新增电池</el-button>
      </div>
      <div>
        <el-table
          ref="batterTable"
          class="batter_table"
          v-loading="loading_battery"
          stripe
          border
          :data="batteyData"
          style="width: 100%"
        >
          <el-table-column prop="name" label="电池名称">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.name"
                placeholder="电池名称"
                clearable
                @focus="inputFocus(scope)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="batteryId" label="电池序列号">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.batteryId"
                placeholder="电池序列号"
                clearable
                @focus="inputFocus(scope)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="type" label="电池类型">
            <template slot-scope="scope">
              <el-select v-model="scope.row.type">
                <el-option label="铅酸蓄电池" :value="0" />
                <el-option label="UPS" :value="1" />
                <el-option label="磷酸铁锂蓄电池" :value="2" />
                <el-option label="超级蓄电池" :value="3" />
                <el-option label="其他" :value="99" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="voltage" label="单体电压">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.voltage"
                type="number"
                min="0"
                clearable
                @focus="inputFocus(scope)"
              />
              <span>V</span>
            </template>
          </el-table-column>
          <el-table-column prop="capacity" label="单体容量">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.capacity"
                type="number"
                min="0"
                clearable
                @focus="inputFocus(scope)"
              />
              <span>Ah</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button
                type="success"
                icon="el-icon-circle-check"
                size="mini"
                title="确定"
                @click="addOneBatter(scope.row)"
              />
              <el-button
                type="warning"
                icon="el-icon-circle-close"
                size="mini"
                title="取消"
                @click="cancelEdit"
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                title="删除"
                @click="deleteBatteryOne(scope.row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleDetermine_b">返 回</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
// 电池类型: 0-铅酸蓄电池;1-UPS;2-磷酸铁锂蓄电池;3-超级蓄电池;99-其他;默认为0
// 状态：0-监控中;1-无效;99-其他

import {
  batteryGroupSave,
  batteryGroupList,
  batteryGroupUpdate,
  batteryGroupDelete,
  batteryGroupDetail,
  batterySave,
  batteryList,
  batteryUpdate,
  batteryDelete
} from "@/api/devices";
import moment from "moment";
import { devnameReg, noChinese, addressReg, limited, lt0 } from "@/utils/exp";

export default {
  name: "BatteryPack",
  data() {
    return {
      deviceId: "",
      params: {
        // 查询参数
        deviceId: "",
        name: "",
        groupId: "",
        brand: "",
        manufacturer: "",
        model: "",
        type: "",
        batchNum: "",
        installTime: "",
        status: ""
      },
      loading: false,
      loading_battery: false,
      tableData: [],
      dialogBatteryPack: false,
      dialogTitle: "新增电池组",
      dialogType: "add",
      form_batteryPack: {
        name: "",
        groupId: "",
        brand: "",
        manufacturer: "",
        model: "",
        batteryNum: "",
        batchNum: "",
        installTime: "",
        remarks: "",
        type: 0
      },
      formRule: {
        name: [
          { required: true, message: "不能为空！", trigger: "blur" },
          {
            required: true,
            min: 2,
            max: 16,
            message: "格式有误，长度应在2-16位！",
            trigger: "blur"
          }
        ]
      },
      updateId: "",
      bg_details: {},
      dialogBattery: false,
      dialogTitle_b: "电池信息",
      batteyData: [],
      batteryParams: {
        batteryGrpId: "",
        batteryId: "",
        name: "",
        type: 0,
        voltage: null,
        capacity: null,
        isEdit: 0
      },
      batterlListParams: {
        batteryGroupId: ""
      },
      batteryNum: 0,
      batteryGrpNum: 0,
      btnDsi: true,
      bgid: "",

      oValItem: {
        id: "",
        batteryId: "",
        name: "",
        type: 0,
        voltage: null,
        capacity: null
      },
      copyBatteryData: {
        batteryId: "",
        name: "",
        voltage: null,
        capacity: null
      }
    };
  },
  created() {},
  mounted() {
    this.deviceId = this.$route.query.id;
    this.batteryGrpNum = this.$route.query.num;

    this.params.deviceId = this.deviceId;
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      batteryGroupList(this.params).then(res => {
        if (res.code === "0") {
          this.loading = false;
          this.tableData = res.data;
        }
      });
    },
    // 搜索
    handleSearch() {
      this.getList();
    },
    // 修改-电池组
    modify(row) {
      console.log(row);
      this.dialogBatteryPack = true;
      this.dialogTitle = "修改电池组";
      this.dialogType = "modify";
      this.form_batteryPack = {
        name: row.name,
        groupId: row.groupId,
        brand: row.brand,
        manufacturer: row.manufacturer,
        model: row.model,
        batteryNum: row.batteryNum,
        batchNum: row.batchNum,
        installTime: "",
        remarks: row.remarks,
        type: row.type
      };
      if (row.installTime == "" || row.installTime == null) {
        this.form_batteryPack.installTime = "";
      } else {
        this.form_batteryPack.installTime = row.installTime;
      }
      this.updateId = row.id;
    },
    // 删除-电池组
    deleteBatteryGroup(row) {
      this.$confirm("确定要删除此电池组吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const data = {
            ids: [row.id]
          };
          batteryGroupDelete(data).then(res => {
            if (res.code === "0") {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.getList();
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除！"
          });
        });
    },
    // 重置
    handleRefresh() {
      this.params = {
        // 查询参数
        deviceId: this.deviceId,
        name: "",
        groupId: "",
        brand: "",
        manufacturer: "",
        model: "",
        type: "",
        batchNum: "",
        installTime: "",
        status: ""
      };
      this.getList();
    },
    // 新增-电池组
    addBatteryPack() {
      if (this.tableData.length >= this.batteryGrpNum) {
        return this.$message({
          type: "warning",
          message: "电池组个数超出限制！"
        });
      }

      this.dialogBatteryPack = true;
      this.dialogTitle = "新增电池组";
      this.dialogType = "add";
    },
    // 取消-电池组
    handleCancel_bp() {
      this.form_batteryPack = {
        name: "",
        groupId: "",
        brand: "",
        manufacturer: "",
        model: "",
        batteryNum: "",
        batchNum: "",
        installTime: "",
        remarks: "",
        type: ""
      };
      this.$refs["form_batteryPack"].resetFields();
      this.dialogBatteryPack = false;
    },
    // 确定-电池组
    handleDetermine_bp() {
      if (this.dialogType == "details") {
        this.dialogBatteryPack = false;
      }
      if (this.form_batteryPack.remarks.trim().length > 200) {
        return this.$message({
          type: "warning",
          message: "备注信息长度不能超过200位！"
        });
      }
      this.$refs.form_batteryPack.validate(valid => {
        if (valid) {
          if (this.dialogType == "add") {
            if (this.form_batteryPack.installTime != "") {
              this.form_batteryPack.installTime = moment(
                this.form_batteryPack.installTime
              ).format("YYYY-MM-DD HH:mm:ss");
            }
            const data = {
              deviceId: this.deviceId,
              ...this.form_batteryPack
            };
            batteryGroupSave(data).then(res => {
              if (res.code === "0") {
                this.$message({
                  type: "success",
                  message: "添加电池组成功！"
                });
                this.handleCancel_bp();
                this.getList();
              }
            });
          }

          if (this.dialogType == "modify") {
            console.log("333", this.form_batteryPack);
            if (this.form_batteryPack.installTime != "") {
              this.form_batteryPack.installTime = moment(
                this.form_batteryPack.installTime
              ).format("YYYY-MM-DD HH:mm:ss");
            }

            const data = {
              deviceId: this.deviceId,
              id: this.updateId,
              ...this.form_batteryPack
            };
            batteryGroupUpdate(data).then(res => {
              if (res.code === "0") {
                this.$message({
                  type: "success",
                  message: "修改电池组成功！"
                });
                this.handleCancel_bp();
                this.getList();
              }
            });
          }
        }
      });
    },
    // 电池组详情
    batteryGroup_details(row) {
      this.dialogBatteryPack = true;
      this.dialogTitle = "电池组详情";
      this.dialogType = "details";
      batteryGroupDetail(row.id).then(res => {
        if (res.code === "0") {
          this.bg_details = res.data;
        }
      });
    },
    // 新增-电池
    addBattery(row) {
      this.dialogBattery = true;
      this.batteryNum = row.batteryNum;
      this.batteryParams.batteryGrpId = row.id;
      this.bgid = row.id;
      this.batterlListParams.batteryGroupId = row.id;
      this.getBatteryList();
    },
    getBatteryList() {
      this.loading_battery = true;
      batteryList(this.batterlListParams).then(res => {
        if (res.code === "0") {
          this.loading_battery = false;
          this.batteyData = res.data;
          this.batteyData.forEach(m => {
            m.voltage = parseInt(m.voltage) / 1000;
            m.capacity = parseInt(m.capacity) / 1000;
          });

          let len = this.batteyData.length;
          if (len > 0) {
            this.copyBatteryData.batteryId = this.batteyData[len - 1].batteryId;
            this.copyBatteryData.name = this.batteyData[len - 1].name;
            this.copyBatteryData.voltage = this.batteyData[len - 1].voltage;
            this.copyBatteryData.capacity = this.batteyData[len - 1].capacity;
          }
        }
      });
    },
    // 弹框新增电池
    addBatteryItem() {
      if (this.batteyData.length >= this.batteryNum) {
        return this.$message({
          type: "warning",
          message: "添加电池数量超出！"
        });
      }
      const status = this.batteyData.some(item => {
        return item.hasOwnProperty("isEdit");
      });
      if (status) {
        return this.$message({
          type: "warning",
          message: "请先完成当前新增的内容！"
        });
      } else {
        // this.batteryParams = {
        //   batteryGrpId: this.bgid,
        //   batteryId: "",
        //   name: "",
        //   type: 0,
        //   voltage: null,
        //   capacity: null,
        //   remarks: "",
        //   isEdit: 0
        // };
        this.batteryParams = {
          batteryGrpId: this.bgid,
          batteryId: this.copyBatteryData.batteryId,
          name: this.copyBatteryData.name,
          type: 0,
          voltage: this.copyBatteryData.voltage,
          capacity: this.copyBatteryData.capacity,
          remarks: "",
          isEdit: 0
        };
        this.batteyData.push(this.batteryParams);
      }
    },
    // 新增电池-行-确定
    addOneBatter(row) {
      if (!row.updateUser) {
        // 新增操作
        if (this.batteryParams.name.trim() == "") {
          return this.$message({
            type: "warning",
            message: "电池名称不能为空！"
          });
        }
        if (this.batteryParams.batteryId.trim() == "") {
          return this.$message({
            type: "warning",
            message: "电池序列号不能为空！"
          });
        }
        this.copyBatteryData.batteryId = this.batteryParams.batteryId;
        this.copyBatteryData.name = this.batteryParams.name;
        this.copyBatteryData.voltage = this.batteryParams.voltage;
        this.copyBatteryData.capacity = this.batteryParams.capacity;

        const data = {
          deviceId: this.deviceId,
          batteryGrpId: this.batteryParams.batteryGrpId,
          batteryId: this.batteryParams.batteryId,
          name: this.batteryParams.name,
          type: this.batteryParams.type,
          voltage: parseInt(this.batteryParams.voltage) * 1000,
          capacity: parseInt(this.batteryParams.capacity) * 1000
        };
        batterySave(data)
          .then(res => {
            if (res.code === "0") {
              this.$message({
                type: "success",
                message: "新增电池成功！"
              });
              this.getBatteryList();
              this.batteryParams = {
                batteryGrpId: "",
                batteryId: "",
                name: "",
                type: 0,
                voltage: null,
                capacity: null,
                isEdit: 0
              };
            }
          })
          .catch(e => {
            (this.batteryParams.voltage =
              parseInt(this.batteryParams.voltage) / 1000),
              (this.batteryParams.capacity =
                parseInt(this.batteryParams.capacity) / 1000);
          });
      } else {
        // 修改操作
        const data_modify = {
          id: row.id,
          batteryId: row.batteryId,
          name: row.name,
          type: row.type,
          voltage: row.voltage,
          capacity: row.capacity
        };
        const str1 = JSON.stringify(this.oValItem);
        const str2 = JSON.stringify(data_modify);
        if (str2 == str1) {
          return this.$message({
            type: "warning",
            message: "您未作修改！"
          });
        }
        batteryUpdate({
          id: row.id,
          batteryId: row.batteryId,
          name: row.name,
          type: row.type,
          voltage: parseInt(row.voltage) * 1000,
          capacity: parseInt(row.capacity) * 1000
        })
          .then(res => {
            if (res.code === "0") {
              this.$message({
                type: "success",
                message: "修改成功！"
              });
              this.getBatteryList();
            }
          })
          .catch(e => {
            (row.voltage = parseInt(row.voltage) / 1000),
              (row.capacity = parseInt(row.capacity) / 1000);
          });
      }
    },
    inputFocus(row) {
      const item = row.row;
      this.oValItem = {
        id: item.id,
        batteryId: item.batteryId,
        name: item.name,
        type: item.type,
        voltage: item.voltage,
        capacity: item.capacity
      };
    },
    cancelEdit() {
      this.getBatteryList();
    },
    deleteBatteryOne(row) {
      if (!row.updateTime) {
        this.batteyData = this.batteyData.filter(item => {
          return item.updateTime;
        });
      } else {
        this.$confirm("确定要删除此电池吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            batteryDelete({
              ids: [row.id]
            }).then(res => {
              if (res.code === "0") {
                this.$message({
                  type: "success",
                  message: "删除成功！"
                });
                this.getBatteryList();
              }
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      }
    },
    handleDetermine_b() {
      this.dialogBattery = false;
    },
    handleCancel_b() {
      this.dialogBattery = false;
      this.batteryParams = {
        batteryGrpId: this.bgid,
        batteryId: "",
        name: "",
        type: 0,
        voltage: null,
        capacity: null
      };
    },
    goback() {
      this.$router.push({ path: "/devices/devicesList" });
    }
  }
};
</script>
<style scoped>
.batteryBox /deep/ .el-dialog__wrapper .el-dialog__header {
  background: #304156;
}
.batteryBox /deep/ .el-dialog__wrapper .el-dialog__header span {
  color: #f4f4f4;
  font-size: 16px;
}
.batteryBox /deep/ .el-dialog {
  border-radius: 5px;
  overflow: hidden;
}

.batteryBox {
  width: 100%;
  height: 100%;
  padding: 10px;
  background: #f0f2f5;
}
.batteryBox .top {
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
.search_col .el-input,
.search_col .el-select {
  width: 9%;
  margin-right: 10px;
}
.search_col span {
  font-size: 14px;
}
.search_col /deep/ .el-input__inner {
  height: 32px;
  line-height: 32px;
  font-size: 14px;
}
.search_col /deep/ .el-input__icon {
  line-height: 32px;
}
.tableBox {
  width: 100%;
  margin-bottom: 20px;
}
.tableBox .el-button {
  padding: 3px 2px;
  font-size: 12px;
}
.table_row /deep/ .el-button {
  font-size: 12px;
  padding: 5px;
}

.batteryBox >>> .el-button {
  font-size: 14px;
}
.batteryBox /deep/ .el-table .el-table__header-wrapper th,
.batteryBox /deep/ .el-table .el-table__body-wrapper td {
  font-size: 12px;
  padding: 5px 0px;
  text-align: center;
}
.devicesName {
  color: blue;
  cursor: pointer;
  text-decoration: underline;
}

.batteryBox /deep/ .el-dialog__body {
  padding: 20px;
}
.batteryBox /deep/ .el-dialog__body .addBattery-btn {
  margin-bottom: 10px;
}

.input-w {
  width: 62% !important;
}
.batter_table .el-input {
  width: 88%;
}
</style>
