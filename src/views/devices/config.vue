<template>
  <div class="configBox" v-loading="loading">
    <el-button
      class="backBtn"
      icon="el-icon-arrow-left"
      type="primary"
      size="small"
      @click="goback"
    >返回</el-button>

    <div class="top">
      <el-card class="box-card">
        <h3 class="title">基本信息</h3>
        <el-form :mode="baseInfo" label-width="150px">
          <el-row>
            <el-col :span="8">
              <el-form-item label="设备名称:">
                <span>{{baseInfo.name}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="设备编号:">
                <span>{{baseInfo.cardId}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="设备类型:">
                <span>{{baseInfo.devType}}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="放电类型:">
                <span v-show="baseInfo.dischargeType==0">逆变放电</span>
                <span v-show="baseInfo.dischargeType==1">升压放电</span>
                <span v-show="baseInfo.dischargeType==2">PTC放电</span>
                <span v-show="baseInfo.dischargeType==3">第三方放电</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="电池组数:">
                <span>{{baseInfo.batteryGrpNum}}</span> 个
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="电压级别:">
                <span v-show="baseInfo.volLevel==0">220V</span>
                <span v-show="baseInfo.volLevel==1">110V</span>
                <span v-show="baseInfo.volLevel==2">48V</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="充电子模块个数:">
                <span>{{baseInfo.chargeNum}}</span> 个
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="放电子模块个数:">
                <span>{{baseInfo.dischargeNum}}</span> 个
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="单体监控子模块个数:">
                <span>{{baseInfo.monitorNum}}</span> 个
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="创建时间:" class="time-item">
                <span>{{baseInfo.createTime}}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
    <el-divider></el-divider>
    <div class="bottom">
      <h3 class="title">
        配置信息
        <el-tooltip class="item" effect="dark" content="点击获取设备配置信息！" placement="top-start">
          <img
            class="getInfoBtn"
            src="@/assets/devices/config.png"
            @click="getConfigInfo"
            alt
            srcset
          />
        </el-tooltip>
      </h3>
      <div class="stepsBox">
        <el-steps :active="active" finish-status="success" align-center>
          <el-step title="网络配置" @click.native="goConfigItem(0)"></el-step>
          <el-step title="充电配置" @click.native="goConfigItem(1)"></el-step>
          <el-step title="核容配置" @click.native="goConfigItem(2)"></el-step>
          <el-step title="时间配置" @click.native="goConfigItem(3)"></el-step>
          <el-step title="固件配置" @click.native="goConfigItem(4)"></el-step>
          <el-step title="温度配置" @click.native="goConfigItem(5)"></el-step>
          <el-step title="现场参数" @click.native="goConfigItem(6)"></el-step>
        </el-steps>
      </div>
      <div class="contentBox">
        <!-- 网络配置 -->
        <el-card class="box-card" v-show="active==0">
          <el-form :mode="netForm" label-width="90px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="设备IP:">
                  <el-input v-model="netForm.configContent.ip" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备端口号:">
                  <el-input v-model="netForm.configContent.port" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户名:">
                  <el-input v-model="netForm.configContent.username" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密码:">
                  <el-input
                    v-model="netForm.configContent.password"
                    type="password"
                    onkeyup="value=value.replace(/[^\w\.\/]/ig,'')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="通讯波特率:">
                  <el-input v-model="netForm.configContent.baudrate" type="number" min="0" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        <!-- 充电配置 -->
        <el-card class="box-card" v-show="active==1">
          <el-form :mode="chargeForm" label-width="160px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="电池组启动充电电压:">
                  <el-input
                    v-model="chargeForm.configContent.MinChargStartBatteryVoltage"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：V ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电池单体启动充电电压:">
                  <el-input
                    v-model="chargeForm.configContent.MinChargStartCellBatteryVoltage"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：V ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电池组充电超时时间:">
                  <el-input
                    type="number"
                    min="0"
                    v-model="chargeForm.configContent.ChargingOvertime"
                  />
                  <span>（ 单位：小时 ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电池组电压上限:">
                  <el-input
                    v-model="chargeForm.configContent.MaxChargStartBatteryVoltage"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：V ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电池单体电压上限:">
                  <el-input
                    v-model="chargeForm.configContent.MaxChargStartCellBatteryVoltage"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：V ）</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        <!-- 核容配置 -->
        <el-card class="box-card" v-show="active==2">
          <el-form :mode="dischargeForm" label-width="160px">
            <el-row :gutter="20">
              <el-col :span="12">
                <!-- 0:容量测试；1:突发测试； -->
                <el-form-item label="当前核容方式:">
                  <el-select v-model="dischargeForm.configContent.CurrentConfirmCapacityMode">
                    <el-option label="容量测试" :value="0"></el-option>
                    <el-option label="突发测试" :value="1"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="慢速放电电流:">
                  <el-input
                    v-model="dischargeForm.configContent.CapacityTestDischargeCurrent"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：AH ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="慢速放电单体电压下限:">
                  <el-input
                    v-model="dischargeForm.configContent.MinCapacityTestDischargeBatteryCellValtage"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：V ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="慢速放电电池电压下限:">
                  <el-input
                    v-model="dischargeForm.configContent.MinCapacityTestDischargeBatteryValtage"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：V ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="慢速放电放电量上限:">
                  <el-input
                    v-model="dischargeForm.configContent.MaxCapacityTestDischargeCapacity"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：AH ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="慢速放电时间上限:">
                  <el-input
                    v-model="dischargeForm.configContent.CapacityTestDischargeDuration"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：h ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="快速放电放电电流:">
                  <el-input
                    v-model="dischargeForm.configContent.BurstTestDischargeCurrent"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：A ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="快速放电放电时间:">
                  <el-input
                    v-model="dischargeForm.configContent.BurstTestDistchargeTime"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：秒 ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="快速放电单体告警电压:">
                  <el-input
                    v-model="dischargeForm.configContent.BurstTestDischargeBatteryCellAlertingValtage"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：V ）</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        <!-- 时间配置 -->
        <el-card class="box-card" v-show="active==3">
          <el-form :mode="monitorForm" label-width="160px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="每日上报周期:">
                  <el-input
                    v-model="monitorForm.configContent.PeriodReportTimes"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：次 ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="定期充电周期:">
                  <el-input
                    v-model="monitorForm.configContent.ChargingPeriod"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：天 ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="核容周期:">
                  <el-input
                    v-model="monitorForm.configContent.ConfirmCapacityPeriod"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：天 ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="两次核容最小间隔周期:">
                  <el-input
                    v-model="monitorForm.configContent.MinConfirmCapacityInterval"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：天 ）</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        <!-- 固件配置 -->
        <el-card class="box-card" v-show="active==4">
          <el-form :mode="hardwareForm" label-width="160px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="软件版本号:">
                  <el-input
                    v-model="hardwareForm.configContent.SoftVersion"
                    onkeyup="this.value=this.value.replace(/[\u4E00-\u9FA5]/g,'')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="硬件版本号:">
                  <el-input
                    v-model="hardwareForm.configContent.HardVersion"
                    onkeyup="this.value=this.value.replace(/[\u4E00-\u9FA5]/g,'')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生产序列号:">
                  <!-- onkeyup="this.value = this.value.replace(/[^\d.]/g,'');" -->
                  <el-input
                    v-model="hardwareForm.configContent.EquipmentProductNum"
                    type="number"
                    min="0"
                  />
                  <div style="color:#bbb;">提示：12位数字</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        <!-- 温度配置 -->
        <el-card class="box-card" v-show="active==5">
          <el-form :mode="temperatureForm" label-width="160px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="环境（电池）温度上限:">
                  <el-input
                    v-model="temperatureForm.configContent.MaxEnvTemperature"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：摄氏度 ）</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="MOS 温度上限:">
                  <el-input
                    v-model="temperatureForm.configContent.MaxBatteryTemperature"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：摄氏度 ）</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        <!-- 现场参数 -->
        <el-card class="box-card" v-show="active==6">
          <el-form :mode="othersForm" label-width="180px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="标称电池电压（Vbc）:" class="selectbox">
                  <el-select v-model="othersForm.configContent.NominalBatteryVoltage">
                    <el-option label="48" :value="48"></el-option>
                    <el-option label="60" :value="60"></el-option>
                    <el-option label="72" :value="72"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电池容量（C）:">
                  <el-input
                    v-model="othersForm.configContent.BatteryCapacity"
                    type="number"
                    min="0"
                  />
                  <div style="color:#bbb;">提示：单位AH，范围0-20</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="标称单体电池电压（Vdt）:">
                  <el-input
                    v-model="othersForm.configContent.NominalCellBatteryVoltage"
                    type="number"
                    min="0"
                  />
                  <span>（ 单位：V ）</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <el-row :gutter="20" class="btns_row">
          <el-col :span="8">
            <el-button type="success" @click="prev" :disabled="active==0">上一步</el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="success" @click="setConfigItem">保存下发</el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="success" @click="next" :disabled="active==6">下一步</el-button>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
import {
  deviceDetail,
  deviceConfigSave,
  deviceConfigUpdate,
  configDownload,
  configUploadItem
} from "@/api/devices";
import { disconnect } from "echarts";
import { stompUrl, exchangeUrl_devMon } from "@/utils/commonVariable";

export default {
  name: "config",
  data() {
    return {
      loading: false,
      client: null,
      headers: {},
      active: 0,
      deviceId: "",
      baseInfo: {},
      //网络配置
      netForm: {
        deviceId: "",
        configType: 0,
        configContent: {
          ip: "0.0.0.0",
          port: "0000",
          username: "root",
          password: "",
          baudrate: "9600"
        }
      },
      //充电配置
      chargeForm: {
        deviceId: "",
        configType: 1,
        configContent: {
          MinChargStartBatteryVoltage: 52,
          MinChargStartCellBatteryVoltage: 13,
          ChargingOvertime: 24,
          MaxChargStartBatteryVoltage: 56,
          MaxChargStartCellBatteryVoltage: 14
        }
      },
      //核容配置
      dischargeForm: {
        deviceId: "",
        configType: 2,
        configContent: {
          CurrentConfirmCapacityMode: 0,
          CapacityTestDischargeCurrent: 0,
          MinCapacityTestDischargeBatteryCellValtage: 11,
          MinCapacityTestDischargeBatteryValtage: 46,
          MaxCapacityTestDischargeCapacity: 0,
          CapacityTestDischargeDuration: 5,
          BurstTestDischargeCurrent: 0,
          BurstTestDistchargeTime: 5,
          BurstTestDischargeBatteryCellAlertingValtage: 9
        }
      },
      //时间配置
      monitorForm: {
        deviceId: "",
        configType: 3,
        configContent: {
          PeriodReportTimes: 1,
          ConfirmCapacityPeriod: 30,
          MinConfirmCapacityInterval: 0,
          ChargingPeriod: 60
        }
      },
      //固件配置
      hardwareForm: {
        deviceId: "",
        configType: 4,
        configContent: {
          SoftVersion: "",
          HardVersion: "",
          EquipmentProductNum: ""
        }
      },
      //温度配置
      temperatureForm: {
        deviceId: "",
        configType: 5,
        configContent: {
          MaxEnvTemperature: 55,
          MaxBatteryTemperature: 80
        }
      },
      //现场参数
      othersForm: {
        deviceId: "",
        configType: 99,
        configContent: {
          NominalBatteryVoltage: "",
          BatteryCapacity: "",
          NominalCellBatteryVoltage: 12
        }
      },

      isSendMsg: false,
      sendItem: ""
    };
  },
  created() {},
  mounted() {
    this.deviceId = this.$route.query.id;
    console.log(this.deviceId);
    this.getDetails(this.deviceId);
    setTimeout(() => {
      this.netForm.deviceId = this.deviceId;
      this.chargeForm.deviceId = this.deviceId;
      this.dischargeForm.deviceId = this.deviceId;
      this.monitorForm.deviceId = this.deviceId;
      this.hardwareForm.deviceId = this.deviceId;
      this.temperatureForm.deviceId = this.deviceId;
      this.othersForm.deviceId = this.deviceId;
    }, 800);
  },
  beforeDestroy() {
    this.client = null;
  },
  methods: {
    getDetails(id) {
      deviceDetail(id).then(res => {
        if (res.code === "0") {
          this.baseInfo = res.data;
          let list = res.data.configList;
          if (list.length > 0) {
            list.forEach(item => {
              switch (item.configType) {
                case 0:
                  this.netForm = item;
                  break;
                case 1: //充电配置
                  this.chargeForm = item;
                  this.chargeForm.configContent.MinChargStartBatteryVoltage = this.formattingNum(
                    this.chargeForm.configContent.MinChargStartBatteryVoltage
                  );
                  this.chargeForm.configContent.MinChargStartCellBatteryVoltage = this.formattingNum(
                    this.chargeForm.configContent
                      .MinChargStartCellBatteryVoltage
                  );
                  this.chargeForm.configContent.MaxChargStartBatteryVoltage = this.formattingNum(
                    this.chargeForm.configContent.MaxChargStartBatteryVoltage
                  );
                  this.chargeForm.configContent.MaxChargStartCellBatteryVoltage = this.formattingNum(
                    this.chargeForm.configContent
                      .MaxChargStartCellBatteryVoltage
                  );

                  break;
                case 2: //核容配置
                  this.dischargeForm = item;
                  this.dischargeForm.configContent.MinCapacityTestDischargeBatteryCellValtage = this.formattingNum(
                    this.dischargeForm.configContent
                      .MinCapacityTestDischargeBatteryCellValtage
                  );
                  this.dischargeForm.configContent.MinCapacityTestDischargeBatteryValtage = this.formattingNum(
                    this.dischargeForm.configContent
                      .MinCapacityTestDischargeBatteryValtage
                  );
                  this.dischargeForm.configContent.BurstTestDischargeBatteryCellAlertingValtage = this.formattingNum(
                    this.dischargeForm.configContent
                      .BurstTestDischargeBatteryCellAlertingValtage
                  );

                  this.dischargeForm.configContent.CapacityTestDischargeCurrent = this.formattingNum(
                    this.dischargeForm.configContent
                      .CapacityTestDischargeCurrent
                  );
                  this.dischargeForm.configContent.MaxCapacityTestDischargeCapacity = this.formattingNum(
                    this.dischargeForm.configContent
                      .MaxCapacityTestDischargeCapacity
                  );
                  this.dischargeForm.configContent.BurstTestDischargeCurrent = this.formattingNum(
                    this.dischargeForm.configContent.BurstTestDischargeCurrent
                  );

                  break;
                case 3:
                  this.monitorForm = item;
                  break;
                case 4:
                  this.hardwareForm = item;
                  break;
                case 5:
                  this.temperatureForm = item;
                  break;
                case 99: //现场参数
                  this.othersForm = item;
                  this.othersForm.configContent.NominalBatteryVoltage = this.formattingNum(
                    this.othersForm.configContent.NominalBatteryVoltage
                  );
                  this.othersForm.configContent.BatteryCapacity = this.formattingNum(
                    this.othersForm.configContent.BatteryCapacity
                  );
                  this.othersForm.configContent.NominalCellBatteryVoltage = this.formattingNum(
                    this.othersForm.configContent.NominalCellBatteryVoltage
                  );
                  break;
              }
            });
          }
        }
      });
    },
    formattingNum(num) {
      return parseInt(num) / 1000;
    },
    formattingNum2(num) {
      return parseInt(num) * 1000;
    },
    next() {
      if (this.active++ > 6) this.active = 6;
    },
    prev() {
      if (this.active-- < 0) this.active = 0;
    },
    goConfigItem(num) {
      this.active = num;
    },
    goback() {
      this.$router.push({ path: "/devices/devicesList" });
    },

    //下方配置
    setConfigItem() {
      switch (this.active) {
        case 0:
          console.log("网络配置");
          this.netForm.configContent.port = parseInt(
            this.netForm.configContent.port
          );
          console.log(this.netForm.configContent.port);
          this.loading = true;
          this.netForm.deviceId = this.deviceId;
          let data1 = {
            cardId: this.baseInfo.cardId,
            deviceId: this.deviceId,
            configType: this.netForm.configType,
            configContent: this.netForm.configContent
          };
          configUploadItem(data1)
            .then(res => {
              if (res.code === "0") {
                this.connect();
              }
            })
            .catch(e => {
              this.loading = false;
            });

          break;
        case 1:
          console.log("充电配置");
          this.loading = true;
          this.sendItem = "charge";
          this.chargeForm.deviceId = this.deviceId;
          this.chargeForm.configContent.MinChargStartBatteryVoltage = this.formattingNum2(
            this.chargeForm.configContent.MinChargStartBatteryVoltage
          );
          this.chargeForm.configContent.MinChargStartCellBatteryVoltage = this.formattingNum2(
            this.chargeForm.configContent.MinChargStartCellBatteryVoltage
          );
          this.chargeForm.configContent.MaxChargStartBatteryVoltage = this.formattingNum2(
            this.chargeForm.configContent.MaxChargStartBatteryVoltage
          );
          this.chargeForm.configContent.MaxChargStartCellBatteryVoltage = this.formattingNum2(
            this.chargeForm.configContent.MaxChargStartCellBatteryVoltage
          );

          let data2 = {
            cardId: this.baseInfo.cardId,
            deviceId: this.deviceId,
            configType: this.chargeForm.configType,
            configContent: this.chargeForm.configContent
          };
          configUploadItem(data2)
            .then(res => {
              if (res.code === "0") {
                this.connect();
              }
            })
            .catch(e => {
              this.loading = false;
            });
          break;
        case 2:
          console.log("核容配置");
          this.loading = true;
          this.sendItem = "discharge";
          this.dischargeForm.deviceId = this.deviceId;
          this.dischargeForm.configContent.CapacityTestDischargeCurrent = this.formattingNum2(
            this.dischargeForm.configContent.CapacityTestDischargeCurrent
          );
          this.dischargeForm.configContent.MinCapacityTestDischargeBatteryCellValtage = this.formattingNum2(
            this.dischargeForm.configContent
              .MinCapacityTestDischargeBatteryCellValtage
          );
          this.dischargeForm.configContent.MinCapacityTestDischargeBatteryValtage = this.formattingNum2(
            this.dischargeForm.configContent
              .MinCapacityTestDischargeBatteryValtage
          );
          this.dischargeForm.configContent.MaxCapacityTestDischargeCapacity = this.formattingNum2(
            this.dischargeForm.configContent.MaxCapacityTestDischargeCapacity
          );
          this.dischargeForm.configContent.BurstTestDischargeCurrent = this.formattingNum2(
            this.dischargeForm.configContent.BurstTestDischargeCurrent
          );
          this.dischargeForm.configContent.BurstTestDischargeBatteryCellAlertingValtage = this.formattingNum2(
            this.dischargeForm.configContent
              .BurstTestDischargeBatteryCellAlertingValtage
          );

          let data3 = {
            cardId: this.baseInfo.cardId,
            deviceId: this.deviceId,
            configType: this.dischargeForm.configType,
            configContent: this.dischargeForm.configContent
          };
          configUploadItem(data3)
            .then(res => {
              if (res.code === "0") {
                this.connect();
              }
            })
            .catch(e => {
              this.loading = false;
            });
          break;
        case 3:
          console.log("时间配置");
          this.loading = true;
          this.monitorForm.deviceId = this.deviceId;
          let data4 = {
            cardId: this.baseInfo.cardId,
            deviceId: this.deviceId,
            configType: this.monitorForm.configType,
            configContent: this.monitorForm.configContent
          };
          configUploadItem(data4)
            .then(res => {
              if (res.code === "0") {
                this.connect();
              }
            })
            .catch(e => {
              this.loading = false;
            });
          break;
        case 4:
          console.log("固件配置");
          if (
            this.hardwareForm.configContent.EquipmentProductNum.length != 12
          ) {
            return this.$message({
              type: "warning",
              message: "格式有误，请输入12位生产序列号数字！"
            });
          }
          this.loading = true;
          this.hardwareForm.deviceId = this.deviceId;
          let data_hard = {
            cardId: this.baseInfo.cardId,
            deviceId: this.deviceId,
            configType: this.hardwareForm.configType,
            configContent: this.hardwareForm.configContent
          };
          configUploadItem(data_hard)
            .then(res => {
              if (res.code === "0") {
                this.loading = false;
                this.$message({
                  type: "success",
                  message: "保存成功！"
                });
              }
            })
            .catch(e => {
              this.loading = false;
            });
          break;
        case 5:
          console.log("温度配置");
          this.loading = true;
          this.temperatureForm.deviceId = this.deviceId;
          let data6 = {
            cardId: this.baseInfo.cardId,
            deviceId: this.deviceId,
            configType: this.temperatureForm.configType,
            configContent: this.temperatureForm.configContent
          };
          configUploadItem(data6)
            .then(res => {
              if (res.code === "0") {
                this.connect();
              }
            })
            .catch(e => {
              this.loading = false;
            });
          break;
        case 6:
          console.log("现场参数");
          this.loading = true;
          this.sendItem = "others";
          this.othersForm.deviceId = this.deviceId;
          this.othersForm.configContent.NominalBatteryVoltage = this.formattingNum2(
            this.othersForm.configContent.NominalBatteryVoltage
          );
          this.othersForm.configContent.BatteryCapacity = this.formattingNum2(
            this.othersForm.configContent.BatteryCapacity
          );
          this.othersForm.configContent.NominalCellBatteryVoltage = this.formattingNum2(
            this.othersForm.configContent.NominalCellBatteryVoltage
          );

          let data7 = {
            cardId: this.baseInfo.cardId,
            deviceId: this.deviceId,
            configType: this.othersForm.configType,
            configContent: this.othersForm.configContent
          };
          configUploadItem(data7)
            .then(res => {
              if (res.code === "0") {
                this.connect();
              }
            })
            .catch(e => {
              this.loading = false;
            });
          break;
      }
    },

    //获取配置信息
    getConfigInfo() {
      this.loading = true;
      configDownload({
        cardId: this.baseInfo.cardId
      })
        .then(res => {
          if (res.code === "0") {
            this.connect();
          }
        })
        .catch(e => {
          this.loading = false;
        });
    },
    // webSocket连接成功后回调函数
    // 获取设备基本信息
    onConnected(frame) {
      //创建随机队列用上面的路由key绑定交换机,放入收到消息后的回调函数和失败的回调函数
      this.client.subscribe(
        exchangeUrl_devMon,
        this.responseCallback,
        this.onFailed
      );

      setTimeout(() => {
        if (this.isSendMsg == false) {
          this.$message({
            type: "warning",
            message: "请求超时，请稍后再试！"
          });
          this.loading = false;
          this.client = null;

          switch (this.sendItem) {
            case "charge":
              this.chargeForm.configContent.MinChargStartBatteryVoltage = this.formattingNum(
                this.chargeForm.configContent.MinChargStartBatteryVoltage
              );
              this.chargeForm.configContent.MinChargStartCellBatteryVoltage = this.formattingNum(
                this.chargeForm.configContent.MinChargStartCellBatteryVoltage
              );
              this.chargeForm.configContent.MaxChargStartBatteryVoltage = this.formattingNum(
                this.chargeForm.configContent.MaxChargStartBatteryVoltage
              );
              this.chargeForm.configContent.MaxChargStartCellBatteryVoltage = this.formattingNum(
                this.chargeForm.configContent.MaxChargStartCellBatteryVoltage
              );
              break;
            case "discharge":
              this.dischargeForm.configContent.CapacityTestDischargeCurrent = this.formattingNum(
                this.dischargeForm.configContent.CapacityTestDischargeCurrent
              );
              this.dischargeForm.configContent.MinCapacityTestDischargeBatteryCellValtage = this.formattingNum(
                this.dischargeForm.configContent
                  .MinCapacityTestDischargeBatteryCellValtage
              );
              this.dischargeForm.configContent.MinCapacityTestDischargeBatteryValtage = this.formattingNum(
                this.dischargeForm.configContent
                  .MinCapacityTestDischargeBatteryValtage
              );
              this.dischargeForm.configContent.MaxCapacityTestDischargeCapacity = this.formattingNum(
                this.dischargeForm.configContent
                  .MaxCapacityTestDischargeCapacity
              );
              this.dischargeForm.configContent.BurstTestDischargeCurrent = this.formattingNum(
                this.dischargeForm.configContent.BurstTestDischargeCurrent
              );
              this.dischargeForm.configContent.BurstTestDischargeBatteryCellAlertingValtage = this.formattingNum(
                this.dischargeForm.configContent
                  .BurstTestDischargeBatteryCellAlertingValtage
              );
              break;
            case "others":
              this.othersForm.configContent.NominalBatteryVoltage = this.formattingNum(
                this.othersForm.configContent.NominalBatteryVoltage
              );
              this.othersForm.configContent.BatteryCapacity = this.formattingNum(
                this.othersForm.configContent.BatteryCapacity
              );
              this.othersForm.configContent.NominalCellBatteryVoltage = this.formattingNum(
                this.othersForm.configContent.NominalCellBatteryVoltage
              );
              break;
          }
        }
      }, 30000);
    },
    onFailed(frame) {
      console.log(" Failed: " + frame);
      this.$message.warning(" socket 连接失败！");
      switch (this.sendItem) {
        case "charge":
          this.chargeForm.configContent.MinChargStartBatteryVoltage = this.formattingNum(
            this.chargeForm.configContent.MinChargStartBatteryVoltage
          );
          this.chargeForm.configContent.MinChargStartCellBatteryVoltage = this.formattingNum(
            this.chargeForm.configContent.MinChargStartCellBatteryVoltage
          );
          this.chargeForm.configContent.MaxChargStartBatteryVoltage = this.formattingNum(
            this.chargeForm.configContent.MaxChargStartBatteryVoltage
          );
          this.chargeForm.configContent.MaxChargStartCellBatteryVoltage = this.formattingNum(
            this.chargeForm.configContent.MaxChargStartCellBatteryVoltage
          );
          break;
        case "discharge":
          this.dischargeForm.configContent.CapacityTestDischargeCurrent = this.formattingNum(
            this.dischargeForm.configContent.CapacityTestDischargeCurrent
          );
          this.dischargeForm.configContent.MinCapacityTestDischargeBatteryCellValtage = this.formattingNum(
            this.dischargeForm.configContent
              .MinCapacityTestDischargeBatteryCellValtage
          );
          this.dischargeForm.configContent.MinCapacityTestDischargeBatteryValtage = this.formattingNum(
            this.dischargeForm.configContent
              .MinCapacityTestDischargeBatteryValtage
          );
          this.dischargeForm.configContent.MaxCapacityTestDischargeCapacity = this.formattingNum(
            this.dischargeForm.configContent.MaxCapacityTestDischargeCapacity
          );
          this.dischargeForm.configContent.BurstTestDischargeCurrent = this.formattingNum(
            this.dischargeForm.configContent.BurstTestDischargeCurrent
          );
          this.dischargeForm.configContent.BurstTestDischargeBatteryCellAlertingValtage = this.formattingNum(
            this.dischargeForm.configContent
              .BurstTestDischargeBatteryCellAlertingValtage
          );
          break;
        case "others":
          this.othersForm.configContent.NominalBatteryVoltage = this.formattingNum(
            this.othersForm.configContent.NominalBatteryVoltage
          );
          this.othersForm.configContent.BatteryCapacity = this.formattingNum(
            this.othersForm.configContent.BatteryCapacity
          );
          this.othersForm.configContent.NominalCellBatteryVoltage = this.formattingNum(
            this.othersForm.configContent.NominalCellBatteryVoltage
          );
          break;
      }
      this.loading = false;
    },
    responseCallback(frame) {
      console.log("111 得到的消息 msg=>");
      console.log(JSON.parse(frame.body));
      let resConfig_body = JSON.parse(frame.body);

      let resConfig = resConfig_body.message;
      if (frame.command === "MESSAGE") {
        this.isSendMsg = true;
        if (
          resConfig_body.cardId == this.baseInfo.cardId &&
          resConfig_body.operationType == 5
        ) {
          this.loading = false;
          this.$message({
            type: "success",
            message: "获取设备配置信息成功！"
          });
          let resConfig_info = JSON.parse(resConfig_body.message);
          //充电配置
          this.chargeForm = {
            deviceId: "",
            configType: 1,
            configContent: {
              MinChargStartBatteryVoltage: this.formattingNum(
                resConfig_info.ChargingParameters.MinChargStartBatteryVoltage
              ),
              MinChargStartCellBatteryVoltage: this.formattingNum(
                resConfig_info.ChargingParameters
                  .MinChargStartCellBatteryVoltage
              ),
              ChargingOvertime:
                resConfig_info.ChargingParameters.ChargingOvertime,
              MaxChargStartBatteryVoltage: this.formattingNum(
                resConfig_info.ChargingParameters.MaxChargStartBatteryVoltage
              ),
              MaxChargStartCellBatteryVoltage: this.formattingNum(
                resConfig_info.ChargingParameters
                  .MaxChargStartCellBatteryVoltage
              )
            }
          };
          //核容配置
          this.dischargeForm = {
            deviceId: "",
            configType: 2,
            configContent: {
              CurrentConfirmCapacityMode:
                resConfig_info.ConfirmCapacityParameters
                  .CurrentConfirmCapacityMode,
              CapacityTestDischargeCurrent: this.formattingNum(
                resConfig_info.ConfirmCapacityParameters
                  .CapacityTestDischargeCurrent
              ),
              MinCapacityTestDischargeBatteryCellValtage: this.formattingNum(
                resConfig_info.ConfirmCapacityParameters
                  .MinCapacityTestDischargeBatteryCellValtage
              ),
              MinCapacityTestDischargeBatteryValtage: this.formattingNum(
                resConfig_info.ConfirmCapacityParameters
                  .MinCapacityTestDischargeBatteryValtage
              ),
              MaxCapacityTestDischargeCapacity: this.formattingNum(
                resConfig_info.ConfirmCapacityParameters
                  .MaxCapacityTestDischargeCapacity
              ),
              CapacityTestDischargeDuration:
                resConfig_info.ConfirmCapacityParameters
                  .CapacityTestDischargeDuration,
              BurstTestDischargeCurrent: this.formattingNum(
                resConfig_info.ConfirmCapacityParameters
                  .BurstTestDischargeCurrent
              ),
              BurstTestDistchargeTime:
                resConfig_info.ConfirmCapacityParameters
                  .BurstTestDistchargeTime,
              BurstTestDischargeBatteryCellAlertingValtage: this.formattingNum(
                resConfig_info.ConfirmCapacityParameters
                  .BurstTestDischargeBatteryCellAlertingValtage
              )
            }
          };
          //时间配置
          this.monitorForm = {
            deviceId: "",
            configType: 3,
            configContent: {
              PeriodReportTimes:
                resConfig_info.TimerParameters.PeriodReportTimes,
              ConfirmCapacityPeriod:
                resConfig_info.TimerParameters.ConfirmCapacityPeriod,
              MinConfirmCapacityInterval:
                resConfig_info.TimerParameters.MinConfirmCapacityInterval,
              ChargingPeriod: resConfig_info.TimerParameters.ChargingPeriod
            }
          };
          //固件配置
          this.hardwareForm = {
            deviceId: "",
            configType: 4,
            configContent: {
              SoftVersion: resConfig_info.SoftVersion,
              HardVersion: resConfig_info.HardVersion,
              EquipmentProductNum: resConfig_info.EquipmentProductNum
            }
          };
          //温度配置
          this.temperatureForm = {
            deviceId: "",
            configType: 5,
            configContent: {
              MaxEnvTemperature:
                resConfig_info.TemperatureParameters.MaxEnvTemperature,
              MaxBatteryTemperature:
                resConfig_info.TemperatureParameters.MaxBatteryTemperature
            }
          };
          //现场参数
          this.othersForm = {
            deviceId: "",
            configType: 99,
            configContent: {
              NominalBatteryVoltage: this.formattingNum(
                resConfig_info.FieldParameters.NominalCellBatteryVoltage
              ),
              BatteryCapacity: this.formattingNum(
                resConfig_info.FieldParameters.NominalCellBatteryVoltage
              ),
              NominalCellBatteryVoltage: this.formattingNum(
                resConfig_info.FieldParameters.NominalCellBatteryVoltage
              )
            }
          };

          this.client.disconnect(() => {
            console.log(" this client disconnect ");
          });
          this.netForm.deviceId = this.deviceId;
          this.chargeForm.deviceId = this.deviceId;
          this.dischargeForm.deviceId = this.deviceId;
          this.monitorForm.deviceId = this.deviceId;
          this.hardwareForm.deviceId = this.deviceId;
          this.temperatureForm.deviceId = this.deviceId;
          this.othersForm.deviceId = this.deviceId;
          deviceConfigSave({
            configList: [
              this.netForm,
              this.chargeForm,
              this.dischargeForm,
              this.monitorForm,
              this.hardwareForm,
              this.temperatureForm,
              this.othersForm
            ]
          }).then(res => {
            if (res.code === "0") {
              deviceDetail(this.deviceId).then(res => {
                if (res.code === "0") {
                  this.baseInfo = res.data;
                }
              });
            } else {
              console.log("config update failed");
            }
          });
        }

        if (
          resConfig_body.cardId == this.baseInfo.cardId &&
          resConfig_body.operationType === 1
        ) {
          this.loading = false;
          this.$message({
            type: "success",
            message: "下发网络配置成功！"
          });
          this.netForm.deviceId = this.deviceId;
          deviceConfigSave({
            configList: [this.netForm]
          }).then(res => {
            if (res.code === "0") {
              deviceDetail(this.deviceId).then(res => {
                if (res.code === "0") {
                  this.baseInfo = res.data;
                }
              });
            } else {
              console.log("config update failed");
            }
          });
          this.client.disconnect(() => {
            console.log(" this client disconnect ");
          });
        }

        if (
          resConfig_body.cardId == this.baseInfo.cardId &&
          resConfig_body.operationType === 8
        ) {
          this.loading = false;
          this.$message({
            type: "success",
            message: "下发充电参数成功！"
          });
          this.chargeForm.deviceId = this.deviceId;
          deviceConfigSave({
            configList: [this.chargeForm]
          }).then(res => {
            if (res.code === "0") {
              deviceDetail(this.deviceId).then(res => {
                if (res.code === "0") {
                  this.baseInfo = res.data;
                }
              });
            } else {
              console.log("config update failed");
            }
          });
          this.client.disconnect(() => {
            console.log(" this client disconnect ");
          });
        }

        if (
          resConfig_body.cardId == this.baseInfo.cardId &&
          resConfig_body.operationType === 10
        ) {
          this.loading = false;
          this.$message({
            type: "success",
            message: "下发下发核容参数成功！"
          });
          this.dischargeForm.deviceId = this.deviceId;
          deviceConfigSave({
            configList: [this.dischargeForm]
          }).then(res => {
            if (res.code === "0") {
              console.log("config update");
              deviceDetail(this.deviceId).then(res => {
                if (res.code === "0") {
                  this.baseInfo = res.data;
                }
              });
            } else {
              console.log("config update failed");
            }
          });

          this.client.disconnect(() => {
            console.log(" this client disconnect ");
          });
        }

        if (
          resConfig_body.cardId == this.baseInfo.cardId &&
          resConfig_body.operationType === 9
        ) {
          this.loading = false;
          this.$message({
            type: "success",
            message: "下发时间参数成功！"
          });
          this.monitorForm.deviceId = this.deviceId;
          deviceConfigSave({
            configList: [this.monitorForm]
          }).then(res => {
            if (res.code === "0") {
              deviceDetail(this.deviceId).then(res => {
                if (res.code === "0") {
                  this.baseInfo = res.data;
                }
              });
            } else {
              console.log("config update failed");
            }
          });
          this.client.disconnect(() => {
            console.log(" this client disconnect ");
          });
        }

        if (
          resConfig_body.cardId == this.baseInfo.cardId &&
          resConfig_body.operationType === 7
        ) {
          this.loading = false;
          this.$message({
            type: "success",
            message: "下发温度参数成功！"
          });
          this.temperatureForm.deviceId = this.deviceId;
          deviceConfigSave({
            configList: [this.temperatureForm]
          }).then(res => {
            if (res.code === "0") {
              console.log("config update");
              deviceDetail(this.deviceId).then(res => {
                if (res.code === "0") {
                  this.baseInfo = res.data;
                }
              });
            } else {
              console.log("config update failed");
            }
          });
          this.client.disconnect(() => {
            console.log(" this client disconnect ");
          });
        }

        if (
          resConfig_body.cardId == this.baseInfo.cardId &&
          resConfig_body.operationType === 6
        ) {
          this.loading = false;
          this.$message({
            type: "success",
            message: "下发现场参数成功！"
          });
          this.othersForm.deviceId = this.deviceId;
          deviceConfigSave({
            configList: [this.othersForm]
          }).then(res => {
            if (res.code === "0") {
              console.log("config update");
              deviceDetail(this.deviceId).then(res => {
                if (res.code === "0") {
                  this.baseInfo = res.data;
                }
              });
            } else {
              console.log("config update failed");
            }
          });
          this.client.disconnect(() => {
            console.log(" this client disconnect ");
          });
        }
      }
    },
    connect() {
      this.client = Stomp.client(stompUrl);
      const headers = {
        login: "admin",
        passcode: "admin",
        host: "/",
        "client-id": "dev-config"
      };
      //不打印ping pong
      this.client.debug = () => {};
      //创建连接,放入连接成功和失败回调函数
      this.client.connect(headers, this.onConnected, this.onFailed);
    }
  }
};
</script>
<style scoped>
.configBox {
  height: 100%;
  padding: 10px;
}

.backBtn {
  position: absolute;
  top: 1%;
  left: 1%;
}
.top {
  width: 85%;
  height: auto;
  margin: 0 auto;
}
.title {
  margin-bottom: 10px;
  color: #3a8ee6;
  text-align: center;
  font-size: 16px;
}
.time-item >>> span {
  white-space: nowrap;
}

.bottom {
  width: 85%;
  height: auto;
  margin: 0 auto;
  margin-top: 30px;
}
.getInfoBtn {
  cursor: pointer;
  margin-left: 20px;
}
.bottom >>> .el-step__title {
  font-size: 14px;
  line-height: 30px;
  cursor: pointer;
}
.bottom >>> .el-step__icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.bottom >>> .el-step__title:hover,
.bottom >>> .el-step__icon:hover {
  color: #67c23a;
}
.stepsBox {
  margin-bottom: 10px;
}
.contentBox {
  width: 100%;
  margin-top: 20px;
  margin: 0 auto;
}

.box-card >>> .el-input {
  width: 25%;
}
.box-card >>> .el-select .el-input {
  width: 60%;
}

.btns_row {
  margin-top: 20px;
}
.btns_row >>> .el-col {
  text-align: center;
}
</style>