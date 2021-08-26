<template>
  <div class="overviewBox">
    <div class="top">
      <div class="top_l">智慧能源监控平台</div>
      <div class="top_r">
        <div class="time">
          <span style="margin-right:10px;">{{hh}}:{{mm}}:{{ss}}</span>
          <span>{{year}}-{{month}}-{{day}}</span>
        </div>
        <div class="date">{{days}}</div>
      </div>
    </div>

    <div class="center">
      <div class="center_l">
        <div class="data1">
          <div class="data1-item" @click="goDevlist">
            <div>
              <img src="../../assets/devices/online2.png" />
              在线：{{statusData.on}}
            </div>
            <div>
              <img src="../../assets/devices/offline2.png" />
              离线：{{statusData.off}}
            </div>
          </div>
          <div class="data1-item" @click="goDevlist">
            <div>
              <img src="../../assets/devices/charge2.png" />
              充电：{{statusData.charge}}
            </div>
            <div>
              <img src="../../assets/devices/discharge2.png" />
              放电：{{statusData.discharge}}
            </div>
          </div>
          <div class="data1-item" @click="goDevlist">
            <div>
              <img src="../../assets/devices/dormancy2.png" />
              休眠：{{statusData.dormancy}}
            </div>
            <div>
              <img src="../../assets/devices/fault2.png" />
              故障：{{statusData.fault}}
            </div>
          </div>
        </div>
        <div class="chart3" id="chart3"></div>
      </div>

      <div id="container" class="center_map" />

      <div class="center_r">
        <div class="btnBox">
          <div class="sysbtn" @click="getSysAlarm">
            <span class :class="{'btn-active':alarmType==0}" /> 系统告警
          </div>
          <div class="devbtn" @click="getDevAlarm">
            <span class :class="{'btn-active':alarmType==1}" /> 设备告警
          </div>
        </div>
        <div class="btnBox2">
          <div class="sysbtn" @click="getSysAlarm2">
            <span class :class="{'btn-active':alarmType_pie==0}" /> 系统告警
          </div>
          <div class="devbtn" @click="getDevAlarm2">
            <span class :class="{'btn-active':alarmType_pie==1}" /> 设备告警
          </div>
        </div>
        <div id="chart2" class="chart2" />
        <div id="chart1" class="data2" />
      </div>
    </div>

    <div class="bottom">
      <div class="bottom_l">
        <!-- <div style="text-align: center;color: white;font-size: 16px;margin-bottom: 5px;">
          <b>设备告警TOP10</b>
        </div>-->
        <el-table
          :data="alarmByDevice"
          border
          style="width: 100%;hieght:95%;background: transparent;"
        >
          <el-table-column prop="name" label="设备名称"></el-table-column>
          <el-table-column prop="station" label="所属站点"></el-table-column>
          <el-table-column prop="status" label="状态">
            <template slot-scope="scope">
              <span v-show="scope.row.status==0">离线</span>
              <span v-show="scope.row.status==1">在线</span>
              <span v-show="scope.row.status==2">休眠</span>
              <span v-show="scope.row.status==3">充电</span>
              <span v-show="scope.row.status==4">放电</span>
              <span v-show="scope.row.status==5">故障</span>
            </template>
          </el-table-column>
          <el-table-column prop="num" label="告警数量" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import {
  withStatus,
  withAlarm,
  withDeviceAlarm,
  withAlarmTime,
  withStation
} from "@/api/statistic";
import * as echarts from "echarts";
import screenfull from "screenfull";
import { deviceStatus } from "@/utils/enum";

export default {
  name: "Overview",
  data() {
    return {
      params: {
        // 设备列表参数
        cardId: "",
        name: "",
        devType: "",
        volLevel: "",
        dischargeType: "",
        status: "",
        pageNo: 1,
        pageSize: 50
      },
      iconSrc: [
        // 离线
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAbJJREFUOE+dkr1rVEEUxc+d/fgTVLCxUUEFLUydRURWWPfNDEQsU9qkSWO63XQWFqJ/gIIWQmDv7BNCmsQoNhG0U4hprPzCwiZV3s6R0X2yvizBZKqZe+/5zZx7R1BZzrk5AG0R+QHgzDj9keRzVX1drZcpgHUAVwBskHyf8iJyFsA1ACuqenNS8xfQ7XaP12q1rwCeATgGYEdVb5fF3vsZkosAbo1GoxN5nn/7DS8LrLU7xpi1wWCwYK2dF5FHJFeNMd9JbsUYXw2Hww/e+4cxxnYI4XQV0AohbHY6nZPNZnMbwBeSuyTvi8hVAJdU9UISWWt7IYTlfwDlS5xzbwC8rdfrS0VR/ARwXVXXnHOryZqqXp7agwkr/RBC33u/QPJBipNcbjQaT4uisKp670DARNNykk/G5175/H1jtNb2RWS2mgDQALA3jqf953KE3vvU4FMkX4pz7kXaTAHsCyVrKZg+G8nz6eJJwCaA1lj1KYTw+CBolmU3jDGLRwY459oA7oj3Po8xvvsfC9UaY8xFsda2RKR3FEAar2RZdk5E0t8/9DLG7KYe3E1eDq3+I1j5BdQlwjTh4uZ0AAAAAElFTkSuQmCC",
        // 在线
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAaNJREFUOE+dkz1rFFEUhp93dH+CUbCxUUGFCGonGGaGEIuATcS/YBGQ7MSUm+0kOxsk/gAFLSR2EYLK7LqKjYqWQrSxEm3s1CJxXrlhd9lsliB7q8v5eM57zrlXjDhp7suGWeBU1/1Z8LTI9GY4XMOGNPe6YU7iRWm2gj8Sp22mBU+KTNcHc/qA5K6PssN34DGw2sr0fjAwyX0JWABucJhjrVv6Efx9QJz7SySeFVXNxyuelriAmAT+GN4KXrcyfUqbvleamXamk3sAacNTxaI68aqPq2RLsGnouOS3IlLE+VZV50JS3HStXVV9D6AnN8n9TvChyHTz6pqPlDv8fb6gn0nuTcFEkeniyBn0jHHDy+1FLae55w1rwW5Trxzi0ba51q4qPxAwoGTD4mFXZq0nf98aQ0WJK8MOi4rM9q4CUYnMt94Kk9z3gRM2r5Tkfhkuox7UsC201h3iHCVnQ+E+IIJOCVO7SeZr+7YeHASNG56VWBgbkKx4hoilANiw+fg/LewboJhUeEAWtbEAph4UnJGZGAdg8Utp03dslsYBhN/5DzhctAuQPdr1AAAAAElFTkSuQmCC",
        // 休眠
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAYpJREFUOE+dkztLA0EUhc+Mr0QTUFEEQQTBTuwshMwmwUIkteJPyEb/g/FH6Goh9qYQBF+Nmp3YayG2sRZSRI3GXefKTIhsfGwwt5iB5c6358w9wxBSliNPCFj62UIX0rYW9HeWcGQKSqVamhi/K+VEwdqRB25WrHwHCEcWpC2WG4CtYp5xvhFsIqU2S2vJvHBK29JO5H4C3GNpW5m2gIQjW8BNEANS0hZpA9CLsRGobvjlKztdFo6kv65I2sKcNUuzNIgBp0ypdXctufdvgAYJR94CmNV/+A4gIrzV3hEd6MPfCogOwfm5zCZWNaD2XEflsYr6m4ehkTiGR+NG8K8Ao2D3OkO+P9eYgqT3umec3t88YHJ6DIPDsTYAx10kRfNNQO2ljmrlBU/VV0xMjSIS7W0PYER9bi55pBV43gd6errg+x/Gf38sAs5ZiAWtgLHxUlbsdzgFdxFgZ2FvJPQSgwc7UmCSuS2XGWczUGoKjOnxk94A/pVMApUBFFuSGEjkpc57OxsEXH0CSTrFPETdN3sAAAAASUVORK5CYII=",
        // 充电
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAbdJREFUOE+N07Fr1GAYBvDn+e4uwcVJ1EtXh0vUQXR0EMFB6CIiWCyiuIhixyIO2m7OCroKQhWv4h+goAi6qIhIL0GFLs13XTprcu33SI7m7F1zrVkyvG9+eXi/9yM2n6AXvqBjO/U77YksuiC4yPrJfFkf9+ZWwK3r0eqe5F0fMDpqG/Hd/wKCrDUHw2hbs1PH+sncTkg/QZCHotGV0UY5PrFePEhZBQ2AqsYC3hUIsvAiiGdjYxpM2Xr8fL+OHKj13CyJYxK+Am6h6yVf2MzDt9rQfDG8UeTg79apmuEsPTPtem4N0EPrJTNB3noA8BboTg4Bzbx1nODnMnYBmDpvUMgAKPXiy+VPmnn4mOD6ENAfJvlS0C/biG+XAKAlgB9sI35TAkWNNd4bBnrhfYKHJJ0vUvwD2BH1rVuPX+0IlEcq6EQxoAHgsEyYT6m/tLgrsHWQm8AdissQX1cDWTRN6un4XddVgWcp064ERj8MsvCnDK51G/H7wT3Jw1UjnVnxk+9DCXU42ram/XtBnuMfnU73JmvNLLpEaMr68eTYVR4tTOTRdUA3JeyjwUfWN2ZW+COtAv4CyxT4rGNk31EAAAAASUVORK5CYII=",
        // 放电
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAcJJREFUOE+N0z1IlWEUB/DfubZFH7QJjUIYaR9YQZEFEbS5JH3Q5H1vUZANfcxGYIstUUPeV4VsFIqmcDHDGhorgwgiaKqhpRqs9Ilrern3NaMXnuE9zzn///+c5/xD4Ut37bLGYQu6hQP4iGe1E5nxYn40BlJVv1CRzAivJG/QqaRTst5PV+OcD401dYCUe4R1SsrR532RabX/RYCUGxQ6fHcs+s0VVF2KipvLsVR1SLgdmW21WKSqI8Kkkt7oM1Eort1tj8xQHWDMRvOmhIdRdi3SsAtanIiy/U3F41rNeWvB0TjjedPdqB7zeqPidKQRtyz4EhUDTUm5aXRHpmnQSy234UFkOiLlpiTTjQApdwfnGwBfRGZvgSDVwGsKhiz4VlSwxPQOGyQdUfGpMMihyHTVFPQJV6KsfcVS5RIORuZpgf0y2iNTrgHsxIzkbFTcL7C0RSZvKr5nrR9e43pkRv/sQdWA0CWcjLKvy7FV2hrDpsj0LO5BnXHEY0mr5GJUPFnRzqitkqpkX+PLNHshd0qSCxOLXiiZ9ctm7BGOCzeibPCvXqgrGbZDi93S4lC34DNmhZdRNvlPN/6vgRrzfgOkS5oRUG9XxAAAAABJRU5ErkJggg==",
        // 故障
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAQCAYAAAD0xERiAAAAAXNSR0IArs4c6QAAAdpJREFUOE+Nk89rE0EUx7/fTTJBpIIgiD8yohSzCd6t4KGKCvXkxaOexKMgCF6EWvAiIoh/goIX7w2KkB4K0T+g7lRF6UYMnhS0lUySfTIhu5lUt+le3sx73/3M4/0gvM/o8moYd8/6vv+d83T0xZFWH2qxPTkNlqebgBmtfoSx3T8NlqfLYEYrSSFhbCcemSxFvo7vdfmiEweQ1xA8AHEvAS/lZTfUQZ4DvJbqVD8ws9/+tGm0igB5BfDyGCDL22Ei1CTnADk0jrEjkE6pX7iSwRIWz9c3tjp52URa3SewmMUFDRAL6T2BPKnHvdvDzBysIP2b1dgurWu16Gwq/KhVfQC0AOwb+VoF4MYAWEs1IvhdJE5nsCDpvQjbvXOmUmo6mwpNRT0CcSe9E1irxvaU3zAXo8jjXcBKTZDzXgnaYWz1PzDiXQbjwFZrX/sr0dHivLNZZt7IjHw/3Sxuhw2zS2uW1wBTUct+sQEMJEkuMAiaEw0TNEajgV87TP0RAIenbYUASzQHMLOjcA9mSPVGgNq4CXJdwGdeU6JA2bnctfEfWD9WXkhEnhKYHflfArjqzgJ8Cshb1Y1uY1cw99Pn43sPdhN7l+K2AGcAtITythyohye+bH53mr+RvtS7LH2bUAAAAABJRU5ErkJggg=="
      ],
      year: "",
      month: "",
      day: "",
      hh: "",
      mm: "",
      ss: "",
      days: "",
      timer: null,
      timer_alarmTime: null,
      myChart1: null,
      myChart2: null,
      myChart3: null,
      areaData: [],
      statusData: {
        off: "",
        on: "",
        charge: "",
        discharge: "",
        dormancy: "",
        others: ""
      },
      alarmType: 0, // 告警类型：0-系统告警；1-设备告警
      alarmType_pie: 0, // 告警分类统计

      dilogViewModle: {
        name: "",
        address: "",
        cardId: "",
        longitude: "",
        latitude: "",
        devType: ""
      },
      city: "定位中...",
      center: "",
      map: null,
      mapLoca: [108.6664045, 34.10936173],
      infoWindow: null,
      pointUrl: require("../../assets/devices/point.png"),
      markers: [],
      stationList: [],
      alarmByDevice: [],
      loginName: ""
    };
  },
  created() {
    const _this = this;
    window.setMarkerLabel = _this.setMarkerLabel;
    window.closeLable = _this.closeLable;
    this.getLocation();
    this.getAlarmTimeData();
    this.timer = setInterval(() => {
      this.getCurrentDate();
    }, 1000);
  },
  mounted() {
    this.getData2();
    this.initMap();
    this.getWithAlarmData();
    this.listenScroll();

    this.timer_alarmTime = setInterval(() => {
      this.getAlarmTimeData();
    }, 240000);
    window.addEventListener("resize", () => {
      setTimeout(() => {
        this.myChart1.resize();
        this.myChart2.resize();
        this.myChart3.resize();
      }, 300);
    });
  },
  beforeDestroy() {
    clearInterval(this.timer);
    clearInterval(this.timer_alarmTime);
    window.removeEventListener("resize", () => {
      this.myChart1 = null;
      this.myChart2 = null;
      this.myChart3 = null;
    });
  },
  methods: {
    // 系统告警--折线图
    getSysAlarm() {
      this.alarmType = 0;
      this.getAlarmTimeData();
    },
    tableHeader(row, index) {
      console.log("row", row);
      console.log("index", index);
    },
    // 跳转到设备监控页面
    jumpToMonitor: function(e) {
      const id = e.target.dataset.id;
      const name = e.target.dataset.name;
      if (id) {
        this.$router.push({
          name: "devicesMonitor",
          params: { deviceInfo: { id, name } }
        });
      } else {
        console.log("e.target.dataset.id 不存在 ,原因还不知道…… ");
      }
    },
    goDevlist() {
      this.$router.push("/devices/devicesList");
    },
    // 设备告警--折线图
    getDevAlarm() {
      this.alarmType = 1;
      this.getAlarmTimeData();
      console.log("this.alarmType", this.alarmType);
    },
    // 系统告警--饼图
    getSysAlarm2() {
      this.alarmType_pie = 0;
      this.getWithAlarmData();
    },
    // 设备告警--饼图
    getDevAlarm2() {
      this.alarmType_pie = 1;
      this.getWithAlarmData();
    },
    // 数据过滤
    filterData(data, type, num) {
      const obj = data.find(item => {
        return item[type] === num;
      });
      return obj.total;
    },
    getData2() {
      // 设备状态分类统计数量
      withStatus().then(res => {
        if (res.code === "0") {
          const list = res.data;
          const aa = this.filterData(list, "status", 0);
          const bb = this.filterData(list, "status", 1);
          const cc = this.filterData(list, "status", 2);
          const dd = this.filterData(list, "status", 3);
          const ee = this.filterData(list, "status", 4);
          const ff = this.filterData(list, "status", 5);
          const gg = this.filterData(list, "status", 99);
          this.statusData = {
            off: aa,
            on: bb,
            charge: dd,
            discharge: ee,
            dormancy: cc,
            fault: ff,
            others: gg
          };
        }
      });

      const obj = JSON.parse(sessionStorage.getItem("userInfo"));
      this.loginName = obj.loginName;
      this.isAdmin = obj.roles.some(item => {
        return item.isAdmin;
      });

      let data = {};
      if (this.loginName !== "admin") {
        const area = obj.area;
        data = {
          area
        };
      }

      // 统计各区域设备数量-柱状图
      withStation(data).then(res => {
        if (res.code === "0") {
          this.areaData = res.data;
          const areaNameList = [];
          const areaNameNum = [];
          this.areaData.forEach(item => {
            areaNameList.push(item.stationName);
            if (item.devices.length > 0) {
              areaNameNum.push(item.devices.length);
            } else {
              areaNameNum.push(0);
            }
          });
          this.myChart3 = echarts.init(document.getElementById("chart3"));
          const option3 = {
            backgroundColor: "#013641 ",
            title: {
              text: "站点设备数量统计",
              left: "center",
              top: "3%",
              textStyle: {
                color: "#f4f4f4",
                fontSize: 16,
                fontWeight: "normal"
              }
            },
            xAxis: {
              type: "category",
              data: areaNameList,
              axisTick: {
                show: false
              },
              axisLine: {
                show: true
              },
              axisLabel: {
                interval: 0,
                rotate: "45",
                textStyle: {
                  color: "#ccc"
                }
              },
              splitLine: {
                show: false
              }
            },
            yAxis: {
              type: "value",
              axisLine: {
                show: true
              },
              axisTick: {
                show: false
              },
              splitLine: {
                show: false
              },
              name: "单位(个)"
            },
            grid: {
              left: "2%",
              right: "2%",
              bottom: "2%",
              containLabel: true
            },
            legend: {
              show: true
            },
            tooltip: {},
            dataZoom: [
              {
                type: "inside"
              }
            ],
            series: [
              {
                data: areaNameNum,
                type: "bar",
                barWidth: 20,
                showBackground: true,
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: "#83bff6" },
                    { offset: 0.5, color: "#188df0" },
                    { offset: 1, color: "#188df0" }
                  ]),
                  borderRadius: [8, 8, 0, 0]
                }
              }
            ]
          };
          this.myChart3.setOption(option3);

          const _this = this;
          // 柱状图点击事件
          this.myChart3.on("click", params => {
            const name = params.name;
            const item = this.areaData.find(i => {
              return i.stationName == name;
            });
            this.mapLoca = [item.longitude, item.latitude];
            this.map.setZoomAndCenter(14, this.mapLoca);
            // 打开信息窗体
            this.setMarkerLabel(item.stationId);
          });
        }
      });

      // 统计设备告警前10的信息--表格
      withDeviceAlarm().then(res => {
        if (res.code == 0) {
          this.alarmByDevice = res.data;
        }
      });
    },
    // 告警分类统计--饼图
    getWithAlarmData() {
      withAlarm({
        alarmType: this.alarmType_pie
      }).then(res => {
        if (res.code === "0") {
          const data = res.data;
          const light = this.filterData(data, "level", 0);
          const normal = this.filterData(data, "level", 1);
          const middle = this.filterData(data, "level", 2);
          const serious = this.filterData(data, "level", 3);

          this.myChart1 = echarts.init(document.getElementById("chart1"));
          const option1 = {
            backgroundColor: "#013641 ",
            title: {
              text: "四色预警",
              left: "center",
              top: "2%",
              textStyle: {
                color: "#f4f4f4",
                fontSize: 16,
                fontWeight: "normal"
              }
            },
            tooltip: {
              trigger: "item"
            },
            visualMap: {
              show: false,
              min: 80,
              max: 600,
              inRange: {
                colorLightness: [0, 1]
              }
            },
            series: [
              {
                name: "四色预警",
                type: "pie",
                radius: "55%",
                center: ["50%", "50%"],
                data: [
                  {
                    value: light,
                    name: "轻度告警",
                    itemStyle: { color: "#4cabce" }
                  },
                  {
                    value: normal,
                    name: "一般告警",
                    itemStyle: { color: "#9a60b4" }
                  },
                  {
                    value: middle,
                    name: "中度告警",
                    itemStyle: { color: "#ea7ccc" }
                  },
                  {
                    value: serious,
                    name: "严重告警",
                    itemStyle: { color: "#c23531" }
                  }
                ].sort(function(a, b) {
                  return a.value - b.value;
                }),
                roseType: "radius",
                label: {
                  color: "#f4f4f4"
                },
                labelLine: {
                  lineStyle: {
                    color: "#ccc"
                  },
                  smooth: 0.2,
                  length: 10,
                  length2: 20
                },
                animationType: "scale",
                animationEasing: "elasticOut",
                animationDelay: function(idx) {
                  return Math.random() * 200;
                }
              }
            ]
          };
          this.myChart1.setOption(option1);
        }
      });
    },
    // 告警消息分时统计
    getAlarmTimeData() {
      withAlarmTime({
        alarmType: this.alarmType
      }).then(res => {
        if (res.code === "0") {
          const xData = [];
          const seriseData = [];
          const result = res.data;
          for (const key in result) {
            xData.push(key);
            seriseData.push(result[key]);
          }
          this.AlarmTimeLine(xData, seriseData);
        }
      });
    },
    // 告警消息分时统计-折线图
    AlarmTimeLine(xd, sd) {
      this.myChart2 = echarts.init(document.getElementById("chart2"));
      const option2 = {
        backgroundColor: "#013641 ",
        color: ["#80FFA5", "#00DDFF", "#37A2FF"],
        title: {
          text: "告警消息分时统计",
          textStyle: {
            color: "#f4f4f4",
            fontSize: 16,
            fontWeight: "normal"
          },
          top: "3%",
          left: "center"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985"
            }
          }
        },
        grid: {
          left: "2%",
          right: "2%",
          bottom: "2%",
          containLabel: true
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            data: xd,
            axisLabel: {
              textStyle: {
                color: "#ccc"
              }
            },
            splitLine: {
              show: false
            }
          }
        ],
        yAxis: [
          {
            type: "value",
            splitLine: {
              show: false
            },
            axisLine: {
              show: true
            },
            name: "单位(个)"
          }
        ],
        series: [
          {
            // name: 'Line 3',
            type: "line",
            stack: "总量",
            smooth: true,
            lineStyle: {
              width: 0
            },
            showSymbol: false,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "rgba(55, 162, 255)"
                },
                {
                  offset: 1,
                  color: "rgba(116, 21, 219)"
                }
              ])
            },
            emphasis: {
              focus: "series"
            },
            // data: seriseData
            data: sd
          }
        ]
      };
      this.myChart2.setOption(option2);
    },
    // 时间格式化
    formatterTime(n) {
      if (n < 10) {
        return "0" + n;
      } else {
        return n;
      }
    },
    // 时间
    getCurrentDate() {
      var myDate = new Date();
      this.year = myDate.getFullYear(); // 年
      this.month = this.formatterTime(myDate.getMonth() + 1); // 月
      this.day = this.formatterTime(myDate.getDate()); // 日
      this.hh = this.formatterTime(myDate.getHours()); //
      this.mm = this.formatterTime(myDate.getMinutes()); //
      this.ss = this.formatterTime(myDate.getSeconds()); //
      var days = myDate.getDay();
      switch (days) {
        case 1:
          this.days = "星期一";
          break;
        case 2:
          this.days = "星期二";
          break;
        case 3:
          this.days = "星期三";
          break;
        case 4:
          this.days = "星期四";
          break;
        case 5:
          this.days = "星期五";
          break;
        case 6:
          this.days = "星期六";
          break;
        case 0:
          this.days = "星期日";
          break;
      }
    },
    // 获取当前位置
    getLocation() {
      const self = this;
      AMap.plugin("AMap.Geolocation", function() {
        var geolocation = new AMap.Geolocation({
          // 是否使用高精度定位，默认：true
          enableHighAccuracy: true,
          // 设置定位超时时间，默认：无穷大
          timeout: 10000
        });

        geolocation.getCurrentPosition();
        AMap.event.addListener(geolocation, "complete", onComplete);
        AMap.event.addListener(geolocation, "error", onError);
        function onComplete(data) {
          // data是具体的定位信息
          // console.log('定位成功信息：', data.addressComponent.city);
          self.city = data.addressComponent.city;
        }
        function onError(data) {
          // 定位出错
          // console.log('定位失败错误：', data);
          // 调用IP定位
          self.getLngLatLocation();
        }
      });
    },
    // 通过IP获取当前位置
    getLngLatLocation() {
      AMap.plugin("AMap.CitySearch", () => {
        var citySearch = new AMap.CitySearch();
        citySearch.getLocalCity((status, result) => {
          if (status === "complete" && result.info === "OK") {
            // 查询成功，result即为当前所在城市信息
            // console.log('通过ip获取当前城市：', result);
            this.center = result.rectangle.split(";")[0];

            // 逆向地理编码
            AMap.plugin("AMap.Geocoder", function() {
              var geocoder = new AMap.Geocoder({
                // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
                city: result.adcode
              });

              var lnglat = result.rectangle.split(";")[0].split(",");
              geocoder.getAddress(lnglat, function(status, data) {
                if (status === "complete" && data.info === "OK") {
                  // result为对应的地理位置详细信息
                  // console.log(data);
                }
              });
            });
          }
        });
      });
    },
    // 地图初始化
    initMap() {
      this.map = new AMap.Map("container", {
        zoom: 10, // 设置地图显示的缩放级别
        center: this.mapLoca, // 设置地图中心点坐标
        mapStyle: "amap://styles/blue", // 设置地图的显示样式
        viewMode: "2D", // 设置地图模式
        lang: "zh_cn" // 设置地图语言类型
      });
      const _this = this;
      withStation()
        .then(res => {
          if (res.code === "0") {
            const list = res.data;
            //
            this.stationList = list.filter(item => {
              return item.latitude != null && item.longitude != null;
            });
            let gmarker;

            // 地图打点
            this.stationList.forEach(item => {
              gmarker = new AMap.Marker({
                position: [item.longitude, item.latitude],
                title: item.stationName,
                extData: item.stationId,
                map: this.map
              });
              const markerContent =
                "" +
                '<div class="custom-content-marker">' +
                '   <img src="' +
                this.pointUrl +
                '">' +
                '   <div class="markerDiv" style="position: absolute;top:8px;right: 5px;color: white;line-height: 15px;text-align: center;width: 20px;font-size: 20px" ' +
                'onclick=setMarkerLabel("' +
                item.stationId +
                '")>' +
                item.devices.length +
                "</div>" +
                "</div>";
              gmarker.setContent(markerContent);
              this.markers.push(gmarker);
            });
          }
          this.map.setFitView();
        })
        .catch(e => {
          console.log(e);
        });
    },
    setMarkerLabel: function(stationId) {
      let marker, devices, stationName;
      this.markers.forEach(m => {
        if (m.getExtData() == stationId) {
          marker = m;
        } else {
          m.setLabel(null);
        }
      });
      this.stationList.forEach(station => {
        if (station.stationId == stationId) {
          devices = station.devices;
          stationName = station.stationName;
        }
      });
      let itemDiv = "";
      if (devices.length == 0) {
        itemDiv = "暂无数据";
      } else {
        for (let i = 0; i < devices.length; i++) {
          console.log("devices[i]", devices[i]);
          itemDiv += `
                        <div class="detail-btn" id="detail-btn" >
                          <div class="df jcsb"  data-id="${
                            devices[i].id
                          }" data-name="${devices[i].name}">
                              <span  data-id="${devices[i].id}" data-name="${
            devices[i].name
          }" > ${devices[i].name}  </span>
                            <div>
                              <img height="12" src="${
                                this.iconSrc[devices[i].status]
                              }"/>
                              <span>${deviceStatus[devices[i].status]}</span>
                            </div>
                          </div>
                        </div>
                      `;
        }
      }
      var labelContent = `
                    <div class="windowBox" >
                      <div class="df jcsb aic">
                        <div class="info-title">${stationName}</div>
                        <div onclick="closeLable('${stationId}')">X</div>
                      </div>
                      <div class="devList" style="    border: solid 1px #084979;">
                        ${itemDiv}
                      </div>
                    </div>
                  `;
      marker.setLabel({
        content: labelContent,
        direction: "top"
      });
      // 启动滚动监听
      this.listenScroll();
      // 启动点击监听
      this.listenClick();
    },
    closeLable: function(stationId) {
      this.cancelListen();
      this.markers.forEach(m => {
        if (m.getExtData() == stationId) {
          m.setLabel(null);
        }
      });
    },
    // label item 点击监听
    listenClick() {
      const _this = this;
      const elements = document.getElementsByClassName("detail-btn");
      Array.from(elements).forEach(function(element) {
        element.addEventListener("click", e => {
          console.log("e.target.dataset", e.target.dataset);
          _this.jumpToMonitor(e);
        });
      });
    },
    // label 弹出框 监听 滚动
    listenScroll() {
      // 找到 windowBox class 的元素
      const elements = document.getElementsByClassName("devList");
      Array.from(elements).forEach(function(element) {
        element.addEventListener("wheel", e => {
          e.stopPropagation(); // 取消向上冒泡,免得滚轮滚动变成了缩放 ……
        });
      });
    },
    // 取消 滚动监听
    cancelListen() {
      const elements = document.getElementsByClassName("devList");
      const elements2 = document.getElementsByClassName("detail-btn");
      /* 取消监听滚动事件*/
      Array.from(elements).forEach(element => {
        element.removeEventListener("wheel", null);
      });
      Array.from(elements2).forEach(element => {
        element.removeEventListener("click", null);
      });
    }
  }
};
</script>

<style scoped >
* {
  margin: 0;
  padding: 0;
}
.overviewBox {
  width: 100%;
  height: 100%;
  background: linear-gradient(top, #053354, #315d7d);
  padding: 5px;
}
.overviewBox >>> .amap-marker-label {
  padding: 2px;
  background: #315d7d !important;
}
.overviewBox >>> .info-title {
  color: white;
  font-size: 13px;
  background: #315d7d !important;
  padding: 5px;
}

.mapBox {
  margin-right: 10px;
}
.overviewBox /deep/ .amap-logo {
  display: none !important;
  visibility: hidden !important;
}
.overviewBox /deep/ .amap-copyright {
  display: none !important;
  visibility: hidden !important;
}

.top {
  width: 100%;
  height: 5%;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}
.top_l {
  font-size: 20px;
  font-weight: 800;
  color: #21ebf0;
  letter-spacing: 4px;
  line-height: 30px;
}
.top_r {
  font-size: 14px;
  text-align: center;
}
.time {
  line-height: 18px;
  color: #fff;
}
.date {
  color: #21ebf0;
  font-size: 14px;
  letter-spacing: 4px;
}

.center {
  width: 100%;
  height: 72%;
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  padding-bottom: 10px;
}
.center_l,
.center_r {
  width: 30%;
  padding: 0 10px;
  position: relative;
}

.center_map {
  width: 40%;
  height: 100%;
  border: 1px solid #333;
  padding: 0 10px;
}
.data1 {
  width: 100%;
  height: 29%;
  background: #013641;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  text-align: center;
  font-size: 14px;
}
.data1 > div {
  width: 30%;
  background: rgba(0, 0, 0, 0.2);
  color: #f4f4f4;
  border-radius: 3px;
  box-shadow: 2px 2px 2px #333;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.data1 > div > div {
  flex: 1;
  font-size: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.data1 > div > div:hover {
  color: #3a8ee6;
}

.data2 {
  width: 100%;
  height: 49%;
  margin-top: 3.5%;
}
.chart2 {
  width: 100%;
  height: 48%;
}
.btnBox {
  position: absolute;
  top: 1%;
  right: 4%;
  z-index: 9999;
}
.btnBox2 {
  position: absolute;
  top: 52%;
  right: 4%;
  z-index: 9999;
}
.btnBox div,
.btnBox2 div {
  color: #f4f4f4;
  vertical-align: middle;
  padding-top: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.btnBox div span,
.btnBox2 div span {
  display: inline-block;
  width: 30px;
  height: 18px;
  padding: 1px;
  border-radius: 3px;
  border: 1px solid #053354;
  background: rgba(160, 154, 154, 0.8);
  font-size: 14px;
  color: #f4f4f4;
  margin-right: 3px;
}
.btnBox div:hover,
.btnBox2 div:hover {
  opacity: 0.5;
}
.btn-active {
  background: #3a8ee6 !important;
}
.devbtn {
  margin-top: 3px;
}
.chart3 {
  width: 100%;
  height: 67%;
  margin-top: 4.5%;
}

.bottom {
  width: 100%;
  height: 22%;
  background: transparent;
  display: flex;
  padding: 0px 10px;
}
.bottom_l {
  width: 100%;
  height: 100%;
}
.bottom_r {
  width: 40%;
  height: 100%;
  margin-left: 10px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
}

.overviewBox >>> .windowBox {
  width: 200px;
  border-radius: 10px;
  margin: 0;
  padding: 5px;
  background: #315d7d;
  color: white;
}

.overviewBox >>> .devList {
  overflow: auto;
  height: 80px;
}

@keyframes twinkling {
  0% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.12);
  }
  100% {
    opacity: 0.2;
    transform: scale(1);
  }
}

.overviewBox >>> #container .amap-marker-label {
  border: 0 none;
  background-color: rgb(248, 248, 250);
  white-space: nowrap;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.3);
  color: #0c0c0c;
  border-radius: 8px;
  font-size: 14px;
}

.overviewBox >>> .windowBox .detail-btn {
  padding: 3px 5px;
  margin: 5px 3px;
  border-radius: 3px;
  background: #013641;
  color: #f4f4f4;
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 14px;
}
.overviewBox >>> .devList::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 3px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}

.overviewBox >>> .devList::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #ebebeb;
}

.overviewBox >>> .devList::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  /* -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2); */
  width: 3px;
  border-radius: 10px;
  background: #fff;
}

.overviewBox >>> .windowBox .detail-btn:hover {
  opacity: 0.8;
}
.overviewBox >>> .windowBox .mt5 {
  margin-top: 5px;
}
.overviewBox >>> .windowBox .mr5 {
  margin-right: 5px;
}
.overviewBox >>> .windowBox .btnbox {
  margin-top: 5px;
  text-align: center;
  border-top: 1px #ccc dotted;
}

.btnBox,
.btnBox2 {
  z-index: 10;
}

.bottom_l /deep/ .el-table {
  border-radius: 5px;
  border-collapse: collapse;
}
.bottom_l /deep/ .el-table .el-table__header-wrapper th {
  text-align: center;
  color: #d0d8df;
  background: #013641;
  font-size: 12px;
}
.bottom_l /deep/ .el-table .el-table__header-wrapper th,
.bottom_l /deep/ .el-table .el-table__body-wrapper td {
  font-size: 12px;
  padding: 6px 0px;
  text-align: center;
  color: white;
}
.bottom_l
  /deep/
  .el-table
  .el-table__body-wrapper
  .el-table__row:nth-of-type(odd) {
  background: #254852;
}
/*table 鼠标悬浮高亮*/
.el-table /deep/tbody tr:hover > td {
  background-color: #0c5e99;
}
.bottom_l
  /deep/
  .el-table
  .el-table__body-wrapper
  .el-table__row:nth-of-type(even) {
  background: #254852;
}

.bottom_l >>> .el-table .el-table__body-wrapper::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 5px; /*高宽分别对应横竖滚动条的尺寸*/
}

.bottom_l >>> .el-table .el-table__body-wrapper::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 3px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #ebebeb;
}

.bottom_l >>> .el-table .el-table__body-wrapper::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  /* -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2); */
  width: 5px;
  border-radius: 3px;
  background: #fff;
}
</style>

