<template>
  <div v-loading="loading" class="sysMonitor">
    <div class="top">
      <div id="chart1" class="chart1" />
      <!--jvm 内存仪表盘-->
      <div id="chart2" class="chart2" />
      <div id="chart3" class="chart3" />
    </div>
    <div class="bottom">
      <div id="chart4" class="chart4" />
      <div id="chart5" class="chart5">
        <div class="bg1">
          <div class="fs16">
            <span class="el-icon-s-order" style="font-size:18px;" /> 主机名:
          </div>
          <div>{{ sysData.sysName }}</div>
        </div>
        <div class="bg2">
          <div class="fs16">
            <span class="el-icon-s-platform" style="font-size:18px;" /> 操作系统:
          </div>
          <div>{{ sysData.osName }}</div>
        </div>
        <div class="bg3">
          <div class="fs16">
            <span class="el-icon-s-marketing" style="font-size:18px;" /> 系统架构:
          </div>
          <div>{{ sysData.osArch }}</div>
        </div>
        <div class="bg4">
          <div class="fs16">
            <span class="el-icon-s-finance" style="font-size:18px;" /> 系统IP:
          </div>
          <div>{{ sysData.sysIp }}</div>
        </div>
      </div>
    </div>
    <div class="chart2_info">使用率: {{ jvmData.usage }} %</div>
    <div class="chart5_title">系统信息</div>
  </div>
</template>
<script>
import { serverOverview } from "@/api/statistic";
import * as echarts from "echarts";
import { getAlarmItemPage } from "@/api/alarm";

export default {
  data() {
    return {
      cpuData: {},
      disksData: [],
      jvmData: {},
      memData: {},
      colorArr: ["#3fb8e3", "#ff5c4d"],
      jvmThresholdVal: 0, // jvm 阈值
      sysData: {},
      loading: true,
      timer: null,
      myChart1: null,
      myChart2: null,
      myChart3: null,
      myChart4: null
    };
  },
  computed: {},
  async created() {
    await this.getJvmThresholdVal(); // 获取jvm 阈值
  },
  mounted() {
    this.getData();
    this.timer = setInterval(() => {
      this.getData();
    }, 2000);
    window.addEventListener("resize", () => {
      setTimeout(() => {
        this.myChart1.resize();
        this.myChart2.resize();
        this.myChart3.resize();
        this.myChart4.resize();
      }, 300);
    });
  },
  beforeDestroy() {
    clearInterval(this.timer);
    window.removeEventListener("resize", () => {
      this.myChart1 = null;
      this.myChart2 = null;
      this.myChart3 = null;
      this.myChart4 = null;
    });
  },
  methods: {
    // 获取jvm 阈值
    async getJvmThresholdVal() {
      const res = await getAlarmItemPage({ itemName: "jvm", pageSize: 999 });
      if (res.code === "0") {
        if (res.data.list.length !== 0) {
          this.jvmThresholdVal = res.data.list[0].thresholdVal;
        }
      }
    },
    getData() {
      this.myChart1 = echarts.init(document.getElementById("chart1"));
      this.myChart2 = echarts.init(document.getElementById("chart2"));
      this.myChart3 = echarts.init(document.getElementById("chart3"));
      this.myChart4 = echarts.init(document.getElementById("chart4"));

      serverOverview().then(res => {
        if (res.code === "0") {
          this.cpuData = res.data.cpu;
          this.disksData = res.data.disks;
          this.jvmData = res.data.jvm;
          this.memData = res.data.mem;
          this.sysData = res.data.sys;

          const option1 = {
            backgroundColor: "#013641 ",
            title: {
              text: "CPU使用率",
              top: "10",
              left: "10",
              textStyle: {
                fontSize: 16,
                color: "#f4f4f4"
              }
            },
            tooltip: {
              formatter: "{c} %"
            },
            grid: {
              bottom: 0
            },
            series: [
              {
                type: "gauge",
                startAngle: 180,
                endAngle: 0,
                min: 0,
                max: res.data.cpu.total,
                splitNumber: 8,
                center: ["50%", "60%"],
                axisLine: {
                  roundCap: true,
                  lineStyle: {
                    width: 18,
                    color: [
                      [0.33, "#7CFFB2"],
                      [0.66, "#FDDD60"],
                      [1, "#FF6E76"]
                    ]
                  }
                },
                pointer: {
                  icon:
                    "path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z",
                  length: "55%",
                  width: 8,
                  offsetCenter: [0, "5%"],
                  temStyle: {
                    color: "auto"
                  }
                },
                axisTick: {
                  length: 5,
                  distance: 3,
                  lineStyle: {
                    color: "auto",
                    width: 2
                  }
                },
                splitLine: {
                  length: 5,
                  lineStyle: {
                    color: "auto",
                    width: 2
                  }
                },
                axisLabel: {
                  color: "#f4f4f4",
                  fontSize: 16,
                  distance: -35,
                  formatter: function(value) {
                    if (value === 1) {
                      return "高";
                    } else if (value === 0.5) {
                      return "中";
                    } else if (value === 0) {
                      return "低";
                    }
                  }
                },
                title: {
                  offsetCenter: [0, "-20%"],
                  fontSize: 30
                },
                detail: {
                  fontSize: 18,
                  valueAnimation: true,
                  backgroundColor: "#fff",
                  borderColor: "#999",
                  borderWidth: 2,
                  width: "50%",
                  lineHeight: 20,
                  height: 20,
                  borderRadius: 5,
                  offsetCenter: [0, "50%"],
                  rich: {
                    value: {
                      fontSize: 18,
                      fontWeight: "bolder",
                      color: "#777"
                    },
                    unit: {
                      fontSize: 12,
                      color: "#999",
                      padding: [0, 0, -5, 10]
                    }
                  },
                  // formatter: function(value) {
                  //   return '{value|' + value.toFixed(0) + '}{unit|%}'
                  // },

                  color: "#333"
                },
                data: [
                  {
                    value: res.data.cpu.used
                  }
                ]
              }
            ]
          };
          this.myChart1.setOption(option1);

          // console.log('res.data.jvm.usage', res.data.jvm.usage)
          const option2 = {
            backgroundColor: "#013641 ",
            title: {
              text: "JVM内存",
              top: "10",
              left: "10",
              textStyle: {
                fontSize: 16,
                color: "#f4f4f4"
              }
            },
            grid: {
              bottom: 0
            },
            tooltip: {
              trigger: "item",
              formatter: "{c} MB"
            },
            series: [
              {
                type: "gauge",
                max: Math.round(res.data.jvm.total),
                progress: {
                  show: true,
                  width: 18
                },
                itemStyle: {
                  color: res.data.jvm.usage > 80 ? "#ff5c4d" : "#3fb8e3"
                  // shadowColor: 'rgb(236,124,124)', //下面都是设置阴影的
                  // shadowBlur: 10,
                  // shadowOffsetX: 2,
                  // shadowOffsetY: 2
                },
                axisLine: {
                  lineStyle: {
                    width: 18
                  }
                },
                axisTick: {
                  show: false
                },
                splitLine: {
                  length: 6,
                  distance: -2,
                  lineStyle: {
                    width: 2,
                    color: "#999"
                  }
                },
                axisLabel: {
                  distance: 25,
                  color: "#999",
                  fontSize: 12
                },
                // anchor: {
                //   show: true,
                //   showAbove: true,
                //   size: 14,
                //   itemStyle: {
                //     borderWidth: 10
                //   }
                // },
                pointer: {
                  length: "50%",
                  width: 8
                },
                title: {
                  show: false
                },
                detail: {
                  valueAnimation: true,
                  fontSize: 18,
                  color: "#f4f4f4",
                  offsetCenter: [0, "80%"],
                  formatter: "{value} MB"
                },
                data: [
                  {
                    value: res.data.jvm.used
                  }
                ]
              }
            ]
          };
          console.log("使用", res.data.jvm.used);
          this.myChart2.setOption(option2);

          const option3 = {
            // backgroundColor: '#1f2d3d ',
            backgroundColor: "#013641 ",
            grid: {
              bottom: 0
            },
            title: {
              text: "MEM内存",
              top: "10",
              left: "10",
              textStyle: {
                fontSize: 16,
                color: "#f4f4f4"
              }
            },
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b}  : {c}GB  ({d}%)"
            },
            legend: {
              orient: "vertical",
              right: "10",
              top: "30",
              textStyle: {
                fontSize: 14,
                color: "#f4f4f4"
              }
            },
            series: [
              {
                name: "mem",
                type: "pie",
                radius: "50%",
                data: [
                  { value: res.data.mem.free, name: "可用" },
                  { value: res.data.mem.used, name: "已用" }
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
          this.myChart3.setOption(option3);

          const freeList = [];
          this.disksData.forEach(item => {
            freeList.push(parseFloat(item.free));
          });
          const usedList = [];
          this.disksData.forEach(item => {
            usedList.push(parseFloat(item.used));
          });
          const totalList = [];
          this.disksData.forEach(item => {
            totalList.push(parseFloat(item.total));
          });

          const nameList = [];
          this.disksData.forEach(item => {
            nameList.push(item.dirName);
          });

          const option4 = {
            // backgroundColor: '#1f2d3d ',
            backgroundColor: "#013641 ",
            tooltip: {
              trigger: "axis",
              axisPointer: {
                // Use axis to trigger tooltip
                type: "shadow" // 'shadow' as default; can also be 'line' or 'shadow'
              }
            },
            title: {
              text: "磁盘大小",
              top: "10",
              left: "10",
              subtext: "单位：MB",
              textStyle: {
                fontSize: 16,
                color: "#f4f4f4"
              }
            },
            legend: {
              top: "10",
              right: "10",
              data: ["已用", "可用", "总计"],
              textStyle: {
                color: "#f4f4f4"
              }
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
              data: nameList
            },
            itemStyle: {
              borderRadius: 5
            },
            series: [
              {
                name: "已用",
                type: "bar",
                stack: "total",
                label: {
                  show: true
                },
                emphasis: {
                  focus: "series"
                },
                // data: [used1, (used2 / 1024).toFixed(2) ]
                data: usedList
              },
              {
                name: "可用",
                type: "bar",
                stack: "total",
                label: {
                  show: true
                },
                emphasis: {
                  focus: "series"
                },
                data: freeList
              },
              {
                name: "总计",
                type: "bar",
                stack: "total",
                label: {
                  show: true
                },
                emphasis: {
                  focus: "series"
                },
                data: totalList
              }
            ]
          };
          this.myChart4.setOption(option4);
          this.loading = false;
        }
      });
    }
  }
};
</script>
<style scoped>
.sysMonitor {
  width: 100%;
  padding: 1%;
  height: 100%;
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(#053354),
    to(#315d7d)
  );
  padding-top: 0px;
  position: relative;
}
.top {
  width: 100%;
  height: 60%;
  padding: 1%;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
}

.top > div {
  flex: 1;
  height: 100%;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 0 5px #333;
  overflow: hidden;
  box-shadow: 0 0 5px #f4f4f4;
}
.chart2 {
  margin: 0px 20px;
}
.bottom {
  width: 100%;
  height: 40%;
  padding: 1%;
  margin-top: 0.5%;
  display: flex;
  justify-content: space-around;
}
.bottom > div {
  width: 50%;
  height: 100%;
  background: #fff;
  border-radius: 5px;
}
.chart4 {
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 0 5px #f4f4f4;
}
.chart5 {
  margin-left: 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  /* background:  #1f2d3d !important; */
  background: #013641 !important ;
  box-shadow: 0 0 5px #f4f4f4;
}
.chart5 > div {
  width: 150px;
  height: 100px;
  border: 1px solid #ccc;
  margin: 10px;
  border-radius: 5px;
}
.chart5 > div > div {
  width: 100%;
  height: 50%;
  text-align: center;
  color: #f0f2f5;
  font-size: 12px;
}
.chart5 > div:hover {
  box-shadow: 0 0 8px #a166ab;
}
.bg1 {
  background: #67c23a;
}
.bg2 {
  background: #e6a23c;
}
.bg3 {
  background: #f56c6c;
}
.bg4 {
  background: #409eff;
}
.fs16 {
  font-size: 18px;
  font-weight: 600;
  line-height: 45px;
  padding-top: 8px;
  text-shadow: 0 0 3px #333;
}

.chart5_title {
  position: absolute;
  right: 23%;
  bottom: 33%;
  font-size: 16px;
  font-weight: bolder;
  color: #f4f4f4;
  font-weight: 800;
}
.chart2_info {
  position: absolute;
  top: 50%;
  left: 47%;
  padding: 5px;
  border: 1px solid #ccc;
  background: transparent;
  color: #eee;
  border-radius: 5px;
  font-size: 14px;
}
</style>
