<template>
  <div v-loading="loading" class="devMonitorBox">
    <!-- :style="{height: tableHeight + 'px',width:'100%'}" -->
    <div class="top">
      <div class="model">
        <div>
          <div v-show="devStatus==0">
            <img src="@/assets/devices/status.png" alt srcset /> 状态：离线
          </div>
          <div v-show="devStatus==1">
            <img src="@/assets/devices/status.png" alt srcset /> 状态：在线
          </div>
          <div v-show="devStatus==2">
            <img src="@/assets/devices/status.png" alt srcset /> 状态：休眠
          </div>
          <div v-show="devStatus==3">
            <img src="@/assets/devices/status.png" alt srcset /> 状态：充电
          </div>
          <div v-show="devStatus==4">
            <img src="@/assets/devices/status.png" alt srcset /> 状态：放电
          </div>
          <div v-show="devStatus==5">
            <img src="@/assets/devices/status.png" alt srcset /> 状态：故障
          </div>
        </div>
        <div>
          <img src="@/assets/devices/temp.png" alt srcset />
          温度：{{ envTemp }} ℃
        </div>
        <div>
          <img src="@/assets/devices/tem.png" alt srcset />
          湿度：{{ envHumidity }} %
        </div>
        <div>
          <img src="@/assets/devices/v.png" alt srcset />
          总电压：{{ totalVol/1000 }} V
        </div>
        <div>
          <img src="@/assets/devices/sign.png" alt srcset />
          信号强度： {{ signalDbm }} Dbm
        </div>
        <div>
          <img src="@/assets/devices/v2.png" alt srcset />
          整流器电压：{{ rectifierVol/1000 }} V
        </div>
      </div>
      <div class="treeBox">
        <div class="devName">
          <el-popover placement="top" width="380" trigger="hover">
            <div class="detailBox">
              <div class="detail-con">
                <h5 style="margin-bottom:5px;">设备详情</h5>
                <el-row :gutter="10">
                  <el-col :span="12">设备名称： {{ defaultName }}</el-col>
                  <el-col :span="12">设备类型： {{ devInfo.devType }}</el-col>
                  <el-col :span="12">电池个数： {{ devInfo.batteryNum }} 个</el-col>
                  <el-col :span="12">充电次数: {{ devInfo.chargeNum }} 次</el-col>
                  <el-col :span="12">放电次数： {{ devInfo.dischargeNum }} 次</el-col>
                  <el-col :span="12">
                    放电类型：
                    <span v-show="devInfo.dischargeType==0">逆变放电</span>
                    <span v-show="devInfo.dischargeType==1">升压放电</span>
                    <span v-show="devInfo.dischargeType==2">PTC放电</span>
                    <span v-show="devInfo.dischargeType==3">第三方放电</span>
                  </el-col>
                </el-row>
              </div>
              <div>
                <el-button
                  type="primary"
                  @click="startDischarge"
                  :disabled="isEnableStatus==false"
                >启动放电</el-button>
                <el-button type="primary" @click="getLolgs">操作记录</el-button>
              </div>
            </div>
            <el-button slot="reference" class="devName-btn border" :title="defaultName">
              <span v-show=" devStatus==0 " class="bg1" />
              <span v-show=" devStatus==1 " class="bg2" />
              <span v-show=" devStatus==2 " class="bg3" />
              <span v-show=" devStatus==3 " class="bg4" />
              <span v-show=" devStatus==4 " class="bg5" />
              <span v-show=" devStatus==5 " class="bg6" />
              <span class="defaultName">{{ defaultName }}</span>
              <span class="el-icon-refresh refresh-btn" title="同步设备状态" @click="resetStatus" />
            </el-button>
          </el-popover>
        </div>
        <transition name="el-fade-in-linear">
          <div class="test-box">
            <div v-if="show" class="bpName border-l">
              <div v-for="(item,index) in batteryGroups " :key="index" class="b-name">
                <div class="border bpTitle" :title="item.name">
                  <el-popover placement="top-start" trigger="hover">
                    <div style="width:320px;">
                      <el-row :gutter="5">
                        <el-col span="12">
                          <span>升电压: {{ item.boostVol/1000 }} V</span>
                        </el-col>
                        <el-col span="12">
                          <span>剩余容量: {{ item.remainingCapacity/1000 }} Ah</span>
                        </el-col>
                        <el-col span="12">
                          <span>总容量: {{ item.totalCapacity/1000 }} Ah</span>
                        </el-col>
                        <el-col span="12">
                          <span>电池组电流: {{ item.totalElectric }} A</span>
                        </el-col>
                        <el-col span="12">
                          <span>总电压: {{ item.totalVol/1000 }} V</span>
                        </el-col>

                        <el-col span="12">
                          <span>电池组序号: {{ item.group_id }}</span>
                        </el-col>
                        <el-col span="12">
                          <span>型号: {{ item.model }}</span>
                        </el-col>
                        <el-col span="12">
                          <span>电池个数: {{ item.batteryNum }} 个</span>
                        </el-col>
                        <el-col span="12">
                          <span>安装时间: {{ item.installTime }}</span>
                        </el-col>
                        <el-col span="12">
                          <span>品牌: {{ item.brand }}</span>
                        </el-col>
                        <el-col span="12">
                          <span>制造商: {{ item.manufacturer }}</span>
                        </el-col>
                        <el-col span="12">
                          类型：
                          <span v-show="item.type==0">铅酸蓄电池</span>
                          <span v-show="item.type==1">UPS</span>
                          <span v-show="item.type==2">磷酸铁锂蓄电池</span>
                          <span v-show="item.type==3">超级蓄电池</span>
                          <span v-show="item.type==99">其他</span>
                        </el-col>
                      </el-row>
                    </div>
                    <div slot="reference">
                      <span v-show="item.status==0" class="bg2" style="margin-right:5px;" />
                      <span v-show="item.status==1" class="bg6" style="margin-right:5px;" />
                      <span>{{ item.name }}</span>
                      <div style="color:rgb(154 152 152);">
                        <div>
                          <span>
                            <span v-show="item.status==0" style="color:rgb(4, 233, 54);">监控中</span>
                            <span v-show="item.status==1" style="color:rgb(206 55 55);">无效</span>
                            <span title="升电压">{{ item.boostVol/1000 || 0 }} V</span>
                          </span>
                          <p>
                            <span title="总电压">{{ item.totalVol/1000 || 0 }} V</span>
                            <span style="margin:0 5px;color:#ccc;">|</span>
                            <span title="总电流">{{ item.totalElectric/1000 || 0 }} A</span>
                          </p>
                          <p>
                            <span title="总容量">{{ item.totalCapacity/1000 || 0 }} Ah</span>
                            <span style="margin:0 5px;color:#ccc;">|</span>
                            <span title="剩余容量">{{ item.remainingCapacity/1000 || 0 }} Ah</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </el-popover>
                </div>

                <div
                  style="width:85%;display:flex;justify-content: flex-start;align-items: center;"
                >
                  <div v-show=" item.batteries.length>0 " class="line" />
                  <div style="width:98%;display:flex;justify-content: flex-start;">
                    <div
                      v-for="(item2,index2) in item.batteries"
                      :key="index2"
                      class="bName-item"
                      style="width:14%;display: inline-block;display:flex;align-items: center;"
                    >
                      <el-popover placement="top-start" trigger="hover">
                        <div style="width:280px;">
                          <el-row :gutter="10">
                            <el-col :span="12">
                              状态：
                              <span v-show="item2.status==0" style="color:rgb(4, 233, 54);">正常</span>
                              <span v-show="item2.status==1" style="color:rgb(218, 13, 13);">异常</span>
                            </el-col>
                            <el-col :span="12">
                              <span>类型：</span>
                              <span v-show=" item2.type==0">铅酸蓄电池</span>
                              <span v-show=" item2.type==1">UPS</span>
                              <span v-show=" item2.type==2">磷酸铁锂蓄电池</span>
                              <span v-show=" item2.type==3">超级蓄电池</span>
                              <span v-show=" item2.type==99">其他</span>
                            </el-col>
                            <el-col :span="12">
                              <span>单体电压：{{ item2.voltage/1000 }} V</span>
                            </el-col>
                            <el-col :span="12">
                              <span>单体容量：{{ item2.capacity/1000 }} Ah</span>
                            </el-col>
                          </el-row>
                        </div>
                        <div slot="reference" class="border">
                          <span v-show="item2.status==0" class="bg2" style="margin-right:5px;" />
                          <span v-show="item2.status==1" class="bg6" style="margin-right:5px;" />
                          <span>{{ item2.name }}</span>
                          <p>
                            <span title="单体电压">{{ item2.voltage/1000 }}V</span>
                            <span style="margin:0 5px;color:#ccc;">|</span>
                            <span title="单体容量">{{ item2.capacity/1000 }} Ah</span>
                          </p>
                        </div>
                      </el-popover>

                      <span class="bName-line">—</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-show="batteryGroups.length==0" class="img-box">
                <el-image :src="imgUrl" style="width:70px;height:70px;"></el-image>
                <h3 style="color:#f4f4f4;margin-top:15px;">暂无电池组</h3>
              </div>
            </div>
          </div>
        </transition>
      </div>
      <div class="selectBox">
        选择设备：
        <el-select v-model="defaultId" filterable @change="selectDev(defaultId)">
          <el-option
            v-for="(item,index) in devlist"
            :key="index"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
    </div>
    <!-- margin-top:5px;margin-bottom:5px; -->
    <!-- <div id="touchmove" style="width: 100%;height: 1px;background: #ababab;cursor: s-resize"></div> -->

    <!-- :style="{height: innerHeight-tableHeight +'px',width: '100%'}" -->
    <div class="bottom">
      <vuedraggable
        v-model="bottomCharts"
        style="width:100%;height:100%;"
        group="people"
        @end="end"
        :options="dragOptions"
      >
        <transition-group
          tag="div"
          class="chartsbox"
          id="mycharts"
          style="width:100%;display:flex;"
        >
          <div
            v-for="item in bottomCharts"
            :id="item"
            :key="item"
            :class="item"
            ref="chart_bot"
            :style=" {width: chartW +'%' } "
          />
        </transition-group>
      </vuedraggable>
    </div>
    <div class="btnbox">
      <el-tooltip class="item" effect="dark" content="显示  /  隐藏更多图表" placement="top-start">
        <el-button @click="showChartsBox" round icon="el-icon-more"></el-button>
      </el-tooltip>
    </div>
    <transition name="el-zoom-in-top">
      <div v-show="drawerCharts" class="chartsBox">
        <div class="title">
          <span>更多图表</span>
        </div>
        <div class="drawer-content">
          <vuedraggable
            v-model="topCharts"
            style="width:100%;"
            group="people"
            :options="dragOptions"
            @end="end"
          >
            <transition-group tag="div" style="width:100%;height:100%;display:flex;">
              <div
                v-for="item in topCharts"
                :id="item"
                :key="item"
                ref="chart_top"
                style="border:1px solid #ccc;"
                :style=" {width: chartW2 +'%' } "
              />
            </transition-group>
          </vuedraggable>
        </div>
      </div>
    </transition>

    <el-dialog
      class="log-dialog"
      title="操作记录"
      :visible.sync="dialog_log"
      width="70%"
      @close="closeDia"
    >
      <div class="logCon">
        <el-row class="top_details">
          <el-col :span="24" class="search_col">
            <span>开始时间：</span>
            <el-date-picker v-model="params_log.startTime" type="datetime" placeholder="开始时间" />
            <span>结束时间：</span>
            <el-date-picker v-model="params_log.endTime" type="datetime" placeholder="开始时间" />
            <el-button size="small" type="primary" @click="handleSearch">确定</el-button>
            <el-button size="small" type="primary" @click="reset">重置</el-button>
          </el-col>
        </el-row>

        <el-table
          class="tableData"
          :data="logsData"
          height="93%"
          stripe
          border
          center
          v-loading="loading2"
          style="width: 100%"
        >
          <el-table-column prop="operationPerson" label="操作人" />
          <el-table-column label="操作类型">
            <!-- 0-同步状态，1-充电，2-放电，3-上传配置，4-下载配置 -->
            <template slot-scope="scope">
              <span v-show="scope.row.operationType==1">下发网络配置</span>
              <span v-show="scope.row.operationType==4">同步设备状态</span>
              <span v-show="scope.row.operationType==5">获取配置信息</span>
              <span v-show="scope.row.operationType==6">下发现场参数</span>
              <span v-show="scope.row.operationType==7">下发温度参数</span>
              <span v-show="scope.row.operationType==8">下发充电参数</span>
              <span v-show="scope.row.operationType==9">下发时间参数</span>
              <span v-show="scope.row.operationType==10">下发核容参数</span>
              <span v-show="scope.row.operationType==11">启动放电</span>
            </template>
          </el-table-column>
          <el-table-column label="操作结果">
            <!-- 0-失败；1-成功 -->
            <template slot-scope="scope">
              <span v-show="scope.row.result==0">失败</span>
              <span v-show="scope.row.result==1">成功</span>
              <span v-show="scope.row.result==2">执行中</span>
            </template>
          </el-table-column>
          <el-table-column label="内容">
            <template slot-scope="scope">{{ scope.row.content }}</template>
          </el-table-column>
          <el-table-column prop="updateTime" label="操作时间" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button size="small" type="primary" @click="handleDetails(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <el-dialog class="details-dialog" title="操作详情" :visible.sync="dialog_details" width="50%">
      <el-form ref="form" :model="detailsData">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="操作人:">
              <span>{{ detailsData.operationPerson }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作类型:">
              <span v-show="detailsData.operationType==1">下发网络配置</span>
              <span v-show="detailsData.operationType==4">同步设备状态</span>
              <span v-show="detailsData.operationType==5">获取配置信息</span>
              <span v-show="detailsData.operationType==6">下发现场参数</span>
              <span v-show="detailsData.operationType==7">下发温度参数</span>
              <span v-show="detailsData.operationType==8">下发充电参数</span>
              <span v-show="detailsData.operationType==9">下发时间参数</span>
              <span v-show="detailsData.operationType==10">下发核容参数</span>
              <span v-show="detailsData.operationType==11">启动放电</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作结果:">
              <span v-show="detailsData.result==0">失败</span>
              <span v-show="detailsData.result==1">成功</span>
              <span v-show="detailsData.result==2">执行中</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作时间:">
              <span>{{ detailsData.updateTime }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作内容:">
              <json-viewer :value="detailsData.content" :expand-depth="3" boxed></json-viewer>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
// 设备状态：0-离线;1-在线;2-休眠;3-充电;4-放电;5-故障
import * as echarts from "echarts";
import { color } from "echarts";
import {
  deviceMonitor,
  devicePage,
  monitorRunLog,
  startDischarge,
  monitorSyncStatus
} from "@/api/devices";
import vuedraggable from "vuedraggable";
import moment from "moment";
import { isEnabled } from "screenfull";
import { stompUrl, exchangeUrl_devMon } from "@/utils/commonVariable";
export default {
  name: "DevicesMonitor",
  components: {
    vuedraggable
  },
  props: ["deviceInfo"],
  data() {
    return {
      // innerHeight: window.innerHeight, // 获取窗口高度
      // tableHeight: window.innerHeight / 2, // 设置第一个div的高度为窗口高度的一半
      params: {
        cardId: "",
        name: "",
        area: "",
        devType: "",
        volLevel: "",
        dischargeType: "",
        status: "",
        pageNo: 1,
        pageSize: 50 //
      },
      devlist: [],
      devInfo: {},
      defaultId: "",
      defaultName: "",
      client: null,

      totalVol: "",
      rectifierVol: "",
      envTemp: "",
      envHumidity: "",
      signalDbm: "",
      devStatus: "",

      batteryGroups: [],
      show: false,
      imgUrl: require("../../assets/noBp.png"),

      drawerCharts: false,
      dragOptions: {
        animation: 120,
        scroll: true,
        group: "sortlist",
        ghostClass: "ghost-style"
      },
      bottomCharts: ["chart1", "chart2", "chart3", "chart4"],
      topCharts: ["more1", "more2", "more3", "more4"],

      params_log: {
        deviceId: "",
        startTime: "",
        endTime: ""
      },
      dialog_log: false,
      queryId: "",
      logsData: [],
      loading: false,
      loading2: false,
      dialog_details: false,
      detailsData: {},

      chartW: 25,
      chartW2: 25,
      bl: 4,
      bl2: 4,
      myChart1: null,
      myChart2: null,
      myChart3: null,
      myChart4: null,
      chart1: null,
      chart2: null,
      chart3: null,
      chart4: null,

      opType: "",
      isEnableStatus: null,
      isSendMsg: false
    };
  },
  watch: {
    deviceInfo: {
      async handler(val, oldVal) {
        await this.getDeviceList(); // 获取 设备列表
        if (val === undefined) {
          // 直接进入页面 默认显示第一个设备
          this.devInfo = this.devlist[0];
          this.defaultId = this.devlist[0].id;
          this.defaultName = this.devlist[0].name;
          this.batteryGroups = [];
          this.getData(this.defaultId);
        } else {
          // 通过 设备概览 点击 某个设备进入这个页面
          this.defaultId = val.id;
          this.defaultName = val.name;
          this.getData(val.id);
        }
      },
      immediate: true,
      deep: true
    },
    bottomCharts(v, ov) {
      if (v) {
        setTimeout(() => {
          this.bl = this.$refs["chart_bot"].length;
          this.chartW = 100 / this.bl;
        }, 500);
      }
    },
    topCharts(v, ov) {
      if (v) {
        setTimeout(() => {
          this.bl2 = this.$refs["chart_top"].length;
          this.chartW2 = 100 / this.bl2;
        }, 500);
      }
    }
  },

  async created() {
    // 获取 设备列表
    const res = await devicePage(this.params);
    if (res.code === "0") {
      this.devlist = res.data.list;
    } else {
      console.log("获取设备列表失败");
    }
  },
  beforeDestroy() {
    this.client = null;
  },
  mounted() {
    setTimeout(() => {
      // let bots = localStorage.getItem("bottoms");
      // let tops = localStorage.getItem("tops");
      // console.log("====bots", bots.split(","));
      // console.log("----tops:", tops.split(","));
      // if (bots != null) {
      //   this.bottomCharts = bots.split(",");
      // }
      // if (tops != null) {
      //   this.topCharts = tops.split(",");
      // }
      this.initLine();
      this.initPie();
      this.initPie2();
      this.initRadar();
    }, 500);

    // document.getElementById("touchmove").onmousedown = this.textWidthChange;
  },
  methods: {
    // 获取 设备列表
    async getDeviceList() {
      const res = await devicePage(this.params);
      if (res.code === "0") {
        this.devlist = res.data.list;
      } else {
        console.log("获取设备列表失败");
      }
    },
    // 获取设备
    getDevices() {
      devicePage(this.params)
        .then(res => {
          if (res.code === "0") {
            this.devlist = res.data.list;
            this.devInfo = res.data.list[0];
            this.defaultId = res.data.list[0].id;
            this.defaultName = res.data.list[0].name;
            this.batteryGroups = [];
            this.getData(this.defaultId);
          }
        })
        .catch(e => {
          console.log(e);
        });
    },
    // 获取设备数据
    getData(id) {
      deviceMonitor(id).then(res => {
        if (res.code === "0") {
          if (res.data && res.data != null) {
            this.show = true;
            this.devInfo = res.data;
            this.batteryGroups = res.data.batteryGroups;
            this.totalVol = res.data.totalVol;
            this.rectifierVol = res.data.rectifierVol;
            this.envTemp = res.data.envTemp;
            this.envHumidity = res.data.envHumidity;
            this.signalDbm = res.data.signalDbm;
            this.devStatus = res.data.status;
            if (res.data.batteryGroups.length > 0) {
              this.isEnableStatus = res.data.batteryGroups.some(item => {
                return item.batteries.length > 0;
              });
            } else {
              this.isEnableStatus = false;
            }
          } else {
            this.show = false;
            this.totalVol = "";
            this.rectifierVol = "";
            this.envTemp = "";
            this.envHumidity = "";
            this.signalDbm = "";
            this.devStatus = "";
          }
        }
      });
    },
    // 选择设备
    selectDev(id) {
      const obj = this.devlist.find(item => {
        return item.id == id;
      });
      this.defaultName = obj.name;
      this.defaultId = obj.id;
      this.getData(id);
    },
    // 获取设备日志
    getLolgs() {
      this.dialog_log = true;
      this.loading2 = true;
      this.params_log.deviceId = this.defaultId;
      monitorRunLog(this.params_log).then(res => {
        if (res.code === "0") {
          this.loading2 = false;
          this.logsData = res.data;
        }
      });
    },
    //日志搜索
    handleSearch() {
      if (this.params_log.startTime != "") {
        this.params_log.startTime = moment(this.params_log.startTime).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      } else {
        return this.$message({
          type: "warning",
          message: "请选择开始时间！"
        });
      }
      if (this.params_log.endTime != "") {
        this.params_log.endTime = moment(this.params_log.endTime).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      } else {
        return this.$message({
          type: "warning",
          message: "请选择结束时间！"
        });
      }
      if (
        parseInt(new Date(this.params_log.startTime).getTime()) >
        parseInt(new Date(this.params_log.endTime).getTime())
      ) {
        return this.$message({
          type: "warning",
          message: "开始时间不能大于结束时间！"
        });
      }

      this.loading2 = true;
      monitorRunLog(this.params_log).then(res => {
        if (res.code === "0") {
          this.loading2 = false;
          this.logsData = res.data;
        }
      });
    },
    reset() {
      this.params_log.startTime = "";
      this.params_log.endTime = "";
      this.getLolgs();
    },
    closeDia() {
      this.params_log = {
        deviceId: "",
        startTime: "",
        endTime: ""
      };
      this.logsData = [];
    },
    logDetermine() {
      this.dialog_log = false;
    },
    //日志详情
    handleDetails(row) {
      this.detailsData = row;
      console.log(typeof this.detailsData.content);
      if (typeof this.detailsData.content == "string") {
        this.detailsData.content = JSON.parse(this.detailsData.content);
      }
      this.dialog_details = true;
    },
    // 启动放电
    startDischarge() {
      this.$confirm("此操作需要谨慎，确定要启动放电吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.opType = "charge";
          this.loading = true;

          startDischarge(this.defaultId)
            .then(res => {
              console.log(res.code);
              if (res.code === "0") {
                this.connect();
              } else {
                this.loading = false;
              }
            })
            .catch(e => {
              this.loading = false;
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消！"
          });
        });
    },
    // 同步设备状态
    resetStatus() {
      if (this.isEnableStatus == false) {
        return this.$message({
          type: "warning",
          message: "无电池组或电池，请先添加电池组和电池！"
        });
      }
      this.opType = "status";
      console.log(this.devInfo);

      this.loading = true;
      monitorSyncStatus({
        cardId: this.devInfo.cardId
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
      // 创建连接,放入连接成功和失败回调函数
      this.client.connect(headers, this.onConnected, this.onFailed);
    },
    // 同步设备状态
    onConnected(frame) {
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
        }
      }, 30000);
    },
    onFailed(frame) {
      console.log(" Failed: " + frame);
      this.$message.warning("socket 连接失败！");
      this.loading = false;
    },
    //同步设备状态回调
    responseCallback(frame) {
      this.loading = false;
      console.log(JSON.parse(frame.body));
      const resConfig_body = JSON.parse(frame.body);
      if (frame.command === "MESSAGE") {
        this.isSendMsg = true;
        if (
          resConfig_body.cardId == this.devInfo.cardId &&
          resConfig_body.operationType == 4
        ) {
          const resConfig = JSON.parse(resConfig_body.message);
          console.log(resConfig);
          this.$message({
            type: "success",
            message: "同步设备状态信息成功！"
          });
          this.getData(this.defaultId);
          this.client.disconnect(() => {
            console.log(" this client disconnect ");
          });
        }

        if (
          resConfig_body.cardId == this.devInfo.cardId &&
          resConfig_body.operationType == 11
        ) {
          this.$message({
            type: "success",
            message: "启动放电成功！"
          });
          this.client.disconnect(() => {
            console.log(" this client disconnect ");
          });
        }
      }
    },

    initLine() {
      this.myChart1 = echarts.init(document.getElementById("chart1"));
      const option1 = {
        // title: {
        //   text: "折线图堆叠"
        // },
        tooltip: {
          trigger: "axis"
        },
        legend: {
          data: ["电池组1", "电池组2"]
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            name: "电池组1",
            type: "line",
            stack: "总量",
            data: [120, 132, 101, 134, 90, 230]
          },
          {
            name: "电池组2",
            type: "line",
            stack: "总量",
            data: [220, 182, 191, 234, 290, 330]
          }
        ]
      };
      this.myChart1.setOption(option1);
    },
    initPie() {
      this.myChart2 = echarts.init(document.getElementById("chart2"));
      const option2 = {
        tooltip: {
          trigger: "item"
        },
        legend: {
          top: "5%",
          left: "center"
        },
        series: [
          {
            name: "访问来源",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: "center"
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "18",
                fontWeight: "bold"
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 1048, name: "系统告警" },
              { value: 735, name: "设备告警" }
            ]
          }
        ]
      };
      this.myChart2.setOption(option2);
    },
    initRadar() {
      this.myChart3 = echarts.init(document.getElementById("chart3"));
      const option3 = {
        // title: {
        //   text: "基础雷达图"
        // },
        // legend: {
        //   data: ["系统告警", "设备告警"]
        // },
        radar: {
          // shape: 'circle',
          indicator: [
            { name: "在线", max: 6500 },
            { name: "离线", max: 16000 },
            { name: "休眠", max: 30000 },
            { name: "故障", max: 38000 }
          ]
        },
        series: [
          {
            name: "预算 vs 开销（Budget vs spending）",
            type: "radar",
            data: [
              {
                value: [4200, 3000, 20000, 35000, 50000, 18000],
                name: "系统告警"
              },
              {
                value: [5000, 14000, 28000, 26000, 42000, 21000],
                name: "设备告警"
              }
            ]
          }
        ]
      };
      this.myChart3.setOption(option3);
    },
    initPie2() {
      this.myChart4 = echarts.init(document.getElementById("chart4"));
      const option4 = {
        tooltip: {
          trigger: "item"
        },
        legend: {
          top: "5%",
          left: "center"
        },
        series: [
          {
            name: "访问来源",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: "center"
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "18",
                fontWeight: "bold"
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 1048, name: "系统告警" },
              { value: 735, name: "设备告警" }
            ]
          }
        ]
      };
      this.myChart4.setOption(option4);
    },

    // 当鼠标向上向下拖动时触发该方法
    // textWidthChange(e) {
    //     let that = this
    //     let dy = e.clientY;//当你第一次单击的时候，存储Y轴的坐标。
    //     document.onmousemove = e => {
    //         if (e.clientY > that.innerHeight) {
    //             return
    //         }
    //         if (e.clientY < dy) {
    //             that.tableHeight -= (dy - e.clientY)
    //         } else {
    //             that.tableHeight += (e.clientY - dy)
    //         }
    //         dy = e.clientY
    //     };
    //     document.onmouseup = e => {
    //         document.onmousemove = null;
    //         document.onmouseup = null;
    //     };
    //     e.stopPropagation();
    //     e.preventDefault();
    //     return false;
    // },

    // 更多图表
    showChartsBox() {
      this.drawerCharts = !this.drawerCharts;
      this.$nextTick(() => {
        this.initMoreChart1();
        this.initMoreChart2();
        this.initMoreChart3();
        this.initMoreChart4();
        this.initLine();
        this.initPie();
        this.initPie2();
        this.initRadar();
      });
    },
    initMoreChart1() {
      this.chart1 = echarts.init(document.getElementById("more1"));
      const option1 = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // Use axis to trigger tooltip
            type: "shadow" // 'shadow' as default; can also be 'line' or 'shadow'
          }
        },
        legend: {
          data: ["Direct", "Mail Ad", "Affiliate Ad"]
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "value"
        },
        yAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        },
        series: [
          {
            name: "Direct",
            type: "bar",
            stack: "total",
            label: {
              show: true
            },
            emphasis: {
              focus: "series"
            },
            data: [320, 302, 301, 334]
          },
          {
            name: "Mail Ad",
            type: "bar",
            stack: "total",
            label: {
              show: true
            },
            emphasis: {
              focus: "series"
            },
            data: [120, 132, 101, 134]
          },
          {
            name: "Affiliate Ad",
            type: "bar",
            stack: "total",
            label: {
              show: true
            },
            emphasis: {
              focus: "series"
            },
            data: [220, 182, 191, 234]
          }
        ]
      };
      this.chart1.setOption(option1);
    },
    initMoreChart2() {
      this.chart2 = echarts.init(document.getElementById("more2"));
      const option2 = {
        // title: {
        //   text: "天气情况统计",
        //   subtext: "虚构数据",
        //   left: "center"
        // },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          bottom: 10,
          left: "center",
          data: ["电压", "电流", "总容量", "剩余容量"]
        },
        series: [
          {
            type: "pie",
            radius: "65%",
            center: ["50%", "50%"],
            selectedMode: "single",
            data: [
              {
                value: 1548,
                name: "电压"
              },
              { value: 735, name: "电流" },
              { value: 510, name: "总容量" },
              { value: 434, name: "剩余容量" }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          }
        ]
      };
      this.chart2.setOption(option2);
    },
    initMoreChart3() {
      this.chart3 = echarts.init(document.getElementById("more3"));
      const option3 = {
        series: [
          {
            type: "gauge",
            center: ["50%", "60%"],
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 60,
            splitNumber: 12,
            itemStyle: {
              color: "#FFAB91"
            },
            progress: {
              show: true,
              width: 15
            },

            pointer: {
              show: false
            },
            axisLine: {
              lineStyle: {
                width: 15
              }
            },
            axisTick: {
              distance: -20,
              splitNumber: 5,
              lineStyle: {
                width: 2,
                color: "#999"
              }
            },
            splitLine: {
              distance: -30,
              length: 14,
              lineStyle: {
                width: 2,
                color: "#999"
              }
            },
            axisLabel: {
              distance: -10,
              color: "#999",
              fontSize: 16
            },
            anchor: {
              show: false
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              width: "60%",
              lineHeight: 40,
              height: "15%",
              borderRadius: 8,
              offsetCenter: [0, "-15%"],
              fontSize: 16,
              fontWeight: "bolder",
              formatter: "{value} °C",
              color: "auto"
            },
            data: [
              {
                value: 20
              }
            ]
          },

          {
            type: "gauge",
            center: ["50%", "60%"],
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 60,
            itemStyle: {
              color: "#FD7347"
            },
            progress: {
              show: true,
              width: 8
            },

            pointer: {
              show: false
            },
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            detail: {
              show: false
            },
            data: [
              {
                value: 20
              }
            ]
          }
        ]
      };
      this.chart3.setOption(option3, true);
    },
    initMoreChart4() {
      this.chart4 = echarts.init(document.getElementById("more4"));
      const option4 = {
        // title: {
        //   text: "漏斗图",
        //   subtext: "纯属虚构"
        // },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c}%"
        },
        legend: {
          data: ["电池1", "电池2", "电池3", "电池4"]
        },

        series: [
          {
            name: "电池组",
            type: "funnel",
            left: "10%",
            top: 60,
            // x2: 80,
            bottom: 60,
            width: "80%",
            // height: {totalHeight} - y - y2,
            min: 0,
            max: 100,
            minSize: "0%",
            maxSize: "100%",
            sort: "descending",
            gap: 2,
            label: {
              show: true,
              position: "inside"
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 1,
                type: "solid"
              }
            },
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 1
            },
            emphasis: {
              label: {
                fontSize: 16
              }
            },
            data: [
              { value: 60, name: "电池1" },
              { value: 40, name: "电池2" },
              { value: 20, name: "电池3" },
              { value: 80, name: "电池4" }
            ]
          }
        ]
      };
      this.chart4.setOption(option4);
    },
    end(evt) {
      setTimeout(() => {
        this.myChart1.resize();
        this.myChart2.resize();
        this.myChart3.resize();
        this.myChart4.resize();
        this.chart1.resize();
        this.chart2.resize();
        this.chart3.resize();
        this.chart4.resize();
        this.initMoreChart1();
        this.initMoreChart2();
        this.initMoreChart3();
        this.initMoreChart4();
        this.initLine();
        this.initPie();
        this.initPie2();
        this.initRadar();

        // let bottoms = this.bottomCharts.toString();
        // let tops = this.topCharts.toString();
        // localStorage.setItem("bottoms", bottoms);
        // localStorage.setItem("tops", tops);
      }, 500);
    }
  }
};
</script>
<style scoped>
@keyframes twinkling {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.12);
  }
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
}
.bg1 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both;
  /* background: #333; */
  background: #f1f1f1;
}
.bg2 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both;
  background: rgb(4, 233, 54);
}
.bg3 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both;
  background: rgb(236, 200, 35);
}
.bg4 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both;
  background: rgb(11, 33, 230);
}
.bg5 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both;
  background: rgb(115, 85, 185);
}
.bg6 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both;
  background: rgb(218, 13, 13);
}

.devMonitorBox {
  width: 100%;
  height: 100%;
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(#053354),
    to(#315d7d)
  );
}
.top {
  padding: 10px;
  position: relative;
  height: 50%;
}

.model {
  position: absolute;
  top: 2%;
  left: 1%;
  width: 75%;
  height: auto;
  padding: 6px 0;
  display: flex;
}
.model > div {
  margin-left: 3%;
  color: #f4f4f4;
  font-size: 14px;
  display: flex;
  align-items: center;
}
.model img {
  width: 18px;
  margin-right: 2px;
}

.selectBox {
  position: absolute;
  top: 2%;
  right: 2%;
  font-size: 14px;
  color: #f4f4f4;
}

.treeBox {
  display: flex;
  width: 99%;
  height: 95%;
  border: 1px solid #ccc;
  margin: 2.5% auto 0%;
  border-radius: 10px;
}
.treeBox > div {
  display: flex;
  height: 100%;
}
.test-box {
  width: 85%;
  height: 100%;
}
.bpName {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding-left: 20px;
  overflow: auto;
  padding-bottom: 6px;
}
.bpName::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 5px; /*高宽分别对应横竖滚动条的尺寸*/
}

.bpName::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 3px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #ebebeb;
}

.bpName::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  /* -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2); */
  width: 5px;
  border-radius: 3px;
  background: #fff;
}
.img-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.devName {
  width: 15%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.devName-btn {
  position: relative;
}
.devName-btn > span {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.defaultName {
  display: inline-block;
  width: 78%;
  font-size: 14px;
  margin-right: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.refresh-btn {
  font-size: 18px;
  color: #2a80eb;
  cursor: pointer;
}
.refresh-btn:hover {
  color: #0971f0;
}
.devName > span {
  width: 85%;
}
.devName-btn {
  width: 100%;
  cursor: default;
}
.devName-btn::before {
  position: absolute;
  top: 50%;
  right: -10%;
  content: "";
  width: 10%;
  height: 1px;
  background: #ccc;
}
.dev-icon {
  font-size: 16px;
  color: rgb(64, 158, 255);
}
.title {
  width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.border {
  border: 1px solid #eee;
  font-size: 14px;
  border-radius: 5px;
  background: #013641;
  color: #f4f4f4;
  padding: 4px;
  text-align: center;
}
.border-l {
  border-left: 1px solid #ccc;
}
.treeBox > div .border:hover {
  background: #ccc;
  color: #013641;
}
.bName-line {
  color: #ccc;
}
.b-name {
  position: relative;
}
.b-name::before {
  position: absolute;
  top: 50%;
  left: -2.5%;
  content: "";
  width: 2.4%;
  height: 1px;
  background: #ccc;
}
.b-name .bName-item:last-of-type .bName-line {
  display: none;
}
.bName-item > span {
  display: inline-block;
}
.bName-item > span:first-of-type {
  width: 92%;
}
.b-name {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.bpTitle {
  width: 15%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 6px;
}
.line {
  width: 25px;
  height: 1px;
  background: #ccc;
}
.bTitle {
  width: 70px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bottom {
  width: 100%;
  height: 50%;
  padding: 20px;
}
.bottom .chartsbox {
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: 100%;
}
.bottom .chartsbox div {
  height: 100%;
  border: 1px solid #ccc;
  margin-right: 10px;
  border-radius: 5px;
}
.bottom .chartsbox div:last-of-type {
  margin-right: 0px;
}
.btnbox {
  position: absolute;
  right: 0%;
  bottom: 47.6%;
}
.btnbox button {
  padding: 8px;
}

.moreCharts >>> .el-drawer__header {
  padding: 10px 20px;
  margin: 0;
  font-size: 16px;
}
.moreCharts >>> .el-drawer__body {
  height: 260px;
  padding: 10px 20px;
}
.drawer-content {
  width: 100%;
  height: 100%;
  display: flex;
}

.chartsBox {
  width: 100%;
  height: auto;
  position: absolute;
  top: 0;
  left: 0;
  background: #1f2d3d;
  padding: 10px 20px;
  border-top: 1px solid #ccc;
}
.chartsBox .title {
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  color: #f4f4f4;
  cursor: pointer;
}
.closeBtn {
  font-size: 18px;
}
.closeBtn:hover {
  color: #2a80eb;
}
.chartsBox {
  overflow: auto;
}
.chartsBox .drawer-content {
  width: 100%;
  height: 230px;
  display: flex;
  margin-top: 10px;
  flex-wrap: nowrap;
}
.chartsBox .drawer-content div {
  height: 100%;
  margin-right: 10px;
  border-radius: 5px;
}

.detail-con {
  padding: 0px 5px;
  margin-bottom: 10px;
}
.detail-con .el-col {
  font-size: 14px;
  line-height: 25px;
}

.log-dialog .top.el-col {
  margin-bottom: 10px;
}
.log-dialog .search_col .el-input {
  width: 15%;
  margin-right: 15px;
  font-size: 14px;
}
.log-dialog /deep/ .el-table .el-table__header-wrapper th,
.log-dialog /deep/ .el-table .el-table__body-wrapper td {
  font-size: 12px;
  padding: 6px 0px;
  text-align: center;
}
.log-dialog /deep/ .el-table .el-table__header-wrapper th {
  background: #304156;
  color: #c8d1db;
}
.devMonitorBox /deep/ .log-dialog .el-dialog {
  height: 70%;
}
.devMonitorBox /deep/ .log-dialog .el-dialog__body {
  padding: 10px;
  height: 91%;
}
.devMonitorBox /deep/ .log-dialog .el-dialog .el-dialog__body .logCon {
  height: 100%;
}
.devMonitorBox
  /deep/
  .log-dialog
  .el-dialog
  .el-dialog__body
  .logCon
  .tableData {
  height: 91%;
  overflow-y: auto;
}
.devMonitorBox /deep/ .el-dialog__wrapper .el-dialog__header {
  background: #304156;
}
.devMonitorBox /deep/ .el-dialog__wrapper .el-dialog__header span {
  color: #f4f4f4;
  font-size: 16px;
}
.devMonitorBox /deep/ .el-dialog {
  border-radius: 5px;
  overflow: hidden;
}
.devMonitorBox /deep/ .details-dialog {
  height: 90%;
  margin-top: 3vh;
}
.devMonitorBox /deep/ .details-dialog .jv-container {
  margin-top: 4%;
}

.devMonitorBox
  /deep/
  .log-dialog
  .el-dialog
  .tableData
  .el-table__body-wrapper::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 15px; /*高宽分别对应横竖滚动条的尺寸*/
}
.devMonitorBox
  /deep/
  .log-dialog
  .el-dialog
  .tableData
  .el-table__body-wrapper::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #ebebeb;
}
.devMonitorBox
  /deep/
  .log-dialog
  .el-dialog
  .tableData
  .el-table__body-wrapper::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  /* -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2); */
  border-radius: 10px;
  background: #fff;
}
</style>
