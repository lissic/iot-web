<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <breadcrumb class="breadcrumb-container" />
    <div class="right-menu">
      <el-tooltip class="item" effect="dark" :content=" '所属区域：' + belongArea" placement="top-start">
        <span
          v-show="inspectionParams.checkPerson !=&quot;admin&quot; "
          class="el-icon-location-information"
        >
          <span class="area-text">{{ area }}</span>
        </span>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="全屏" placement="top-start">
        <span v-if="!isScreenFull" class="el-icon-full-screen" @click="toggleFullscreen" />
        <span v-else class="el-icon-copy-document" @click="toggleFullscreen" />
      </el-tooltip>
      <!-- <el-tooltip class="item" effect="dark" content="切换主题" placement="top-start">
         <span class="el-icon-picture-outline-round"></span>
      </el-tooltip>-->
      <el-popover width="300" placement="bottom" class="topPopover" trigger="hover">
        <el-tabs v-model="activeName" class="popoverBox" type="card" @tab-click="handleClick">
          <el-tab-pane label="告警信息" name="first">
            <ul v-if="alarmData.length>0" class="alarm_popover_ul">
              <li v-for="(item,index) in alarmData" :key="item.id" @click="goAlarmClear(item)">
                <span>{{ index + 1 }}</span>
                <span>{{ item.alarmObject }}</span>
                <span>{{ item.alarmStrategyName }}</span>
                <span>{{ item.alarmVal }}</span>
              </li>
            </ul>
            <div v-else style="text-align:center;">
              <img src="@/assets/noData.png" style="width:80px;margin-bottom:10px;" />
              <div>暂无告警消息</div>
            </div>
            <el-button
              v-show="alarmData.length>9"
              plain
              size="medium"
              type="text"
              @click="jumpToAlarmDetails(0)"
            >更多系统告警</el-button>
            <el-button
              style="margin-left:10%;"
              v-show="alarmData.length>9"
              plain
              size="medium"
              type="text"
              @click="jumpToAlarmDetails(1)"
            >更多设备告警</el-button>
          </el-tab-pane>
          <el-tab-pane label="待办任务" name="second">
            <ul v-if="inspList.length>0" class="alarm_popover_ul">
              <li v-for="(item,index) in inspList" :key="item.id" @click="goInsp(item)">
                <span>{{ index + 1 }}</span>
                <span>{{ item.name }}</span>
              </li>
            </ul>
            <div v-else style="text-align:center;">
              <img src="@/assets/noTasks.png" style="width:80px;margin-bottom:10px;" />
              <div>暂无待办任务</div>
            </div>
            <el-button
              v-show="inspList.length>9"
              size="medium"
              type="text"
              @click="jumpToDevicesInspection"
            >查看更多</el-button>
          </el-tab-pane>
        </el-tabs>

        <el-badge
          slot="reference"
          :is-dot="alarmData.length>0 || inspList.length>0"
          class="item noticeBadge"
        >
          <span class="el-icon-bell" />
        </el-badge>
      </el-popover>

      <el-dropdown class="avatar-container" trigger="hover">
        <div class="avatar-wrapper">
          <img v-if="avatar" style="width:25px;height:25px;" :src="avatar" class="user-avatar" />
          <img v-else style="width:25px;height:25px;" src="@/assets/user.png" class="user-avatar" />
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item @click.native="goPersonal">
            <span style="display:block;">
              <span class="el-icon-s-custom" /> 个人中心
            </span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">
              <span class="el-icon-s-promotion" /> 退出
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import screenfull from "screenfull";
import Stomp from "stompjs";
import { stompUrl, exchangeUrl } from "@/utils/commonVariable";
import { inspectionList } from "@/api/devices";
import { interval, from } from "rxjs";
import { alarmPage } from "@/api/sys";

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      isScreenFull: false, // 是否全屏
      alarmData: [],
      client: null,
      getInsList$: undefined,
      activeName: "first",
      area: "",
      isAdmin: null,
      inspectionParams: {
        checkPerson: "",
        status: 0
      },
      inspList: [],
      alarmParams: {
        alarmType: "",
        status: 0,
        pageNo: 1,
        pageSize: 10
      }
    };
  },
  computed: {
    ...mapGetters(["sidebar", "avatar", "name"]),
    alarmDataLength() {
      return this.alarmData.length;
    },
    belongArea() {
      if (this.area == "" || this.area == null) {
        return "暂无";
      } else {
        return this.area;
      }
    }
  },
  created() {
    // 初始化连接
    this.connect();
    // 定义设备流
    this.getInsList$ = interval(2000).subscribe(async x => {
      const res = await inspectionList({
        checkPerson: this.name,
        status: 0
      }).catch(_ => {
        location.reload();
      });
      if (res.code === "0") {
        this.inspList = res.data.slice(0, 10);
      }
    });
    this.getAlarmPage();
  },
  mounted() {
    const obj = JSON.parse(sessionStorage.getItem("userInfo"));
    this.inspectionParams.checkPerson = obj.loginName;
    this.area = obj.area;
    // this.isAdmin =  obj.roles.some( item=>{
    //   return item.isAdmin === true
    // })

    // 监听窗口大小改变，screenfull.isFullscreen的值为是否全屏，若是则true，反之false
    window.onresize = () => {
      this.isScreenFull = screenfull.isFullscreen;
    };
  },
  beforeDestroy() {
    this.client.disconnect();
  },
  destroyed() {
    // 页面销毁时取消订阅
    this.getInsList$.unsubscribe();
    // 同时销毁 websocket
    this.client.disconnect();
  },
  methods: {
    getInspection() {
      // 根据 用户 获取 待办巡检列表
      inspectionList(this.inspectionParams).then(res => {
        if (res.code === "0") {
          this.inspList = res.data.slice(0, 10);
          console.log("this.inspList", this.inspList);
        }
      });
    },
    //获取告警信息
    getAlarmPage() {
      alarmPage(this.alarmParams).then(res => {
        if (res.code === "0") {
          this.alarmData = res.data.list;
        }
      });
    },
    //跳转到告警清除页面
    jumpToAlarmDetails(type) {
      if (type == 0) {
        //系统告警
        this.$router.push("/sys/operations/clear");
      }
      if (type == 1) {
        //设备告警
        this.$router.push("/devices/alarms");
      }
    },
    handleClick(tab, event) {
      if (tab.name === "second") {
        this.getInspection();
      }
    },
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    },
    goPersonal() {
      this.$router.push("/personalCenter");
    },
    goSetting() {
      this.$router.push("/setting");
    },
    // 全屏切换
    toggleFullscreen() {
      if (!screenfull.isEnabled) {
        // 判断一下浏览器是否支持全屏显示
        this.$message({
          message: "浏览器不能全屏",
          type: "warning"
        });
        return false;
      }
      screenfull.toggle();
    },
    // 清除列表中的告警消息
    goAlarmClear(data) {
      if (data.alarmType === 0) {
        this.$router.push({
          path: "/sys/operations/clear",
          query: { id: data.id }
        });
      }
      if (data.alarmType === 1) {
        this.$router.push({
          path: "/devices/alarms",
          query: { id: data.id }
        });
      }
      this.alarmData = this.alarmData.filter(item => {
        return item.id != data.id;
      });
    },
    // 点击某条具体的待办任务
    goInsp(data) {
      // 检查当前 页面 是否在 设备巡检页
      if (this.$route.name === "devicesInspection") {
        // 在的话给传个值
        this.$store.dispatch("deviceInspection/changeHighlightId", data.id);
      } else {
        // 跳转到 设备巡检列表页面 ,并且将 id 传过去
        this.$router.push({
          name: "devicesInspection",
          params: { jumpId: data.id }
        });
      }
    },
    // 跳转到路由
    jumpToDevicesInspection() {
      this.$router.push({ name: "devicesInspection" });
    },
    // webSocket连接成功后回调函数
    onConnected(frame) {
      // 绑定交换机exchange_pushmsg是交换机的名字rk_pushmsg是绑定的路由key
      // 创建随机队列用上面的路由key绑定交换机,放入收到消息后的回调函数和失败的回调函数
      this.client.subscribe(exchangeUrl, this.responseCallback, this.onFailed);
    },
    onFailed(frame) {
      console.log("Failed: " + frame);
      this.$message.warning("socket 连接失败！");
    },
    responseCallback(frame) {
      if (frame.command === "MESSAGE") {
        const msg = JSON.parse(frame.body);
        console.log(msg);
        // msg.alarmMethod == 1
        if (msg.alarmMethod.includes("1")) {
          this.$notify({
            title: msg.alarmObject,
            dangerouslyUseHTMLString: true,
            message: `
                <div style='border-bottom:1px solid #ccc;'>
                  <span class='el-icon-warning' style="color:red;">  </span>
                  <span> ${msg.alarmStrategyName} </span>  --
                  <span> ${
                    msg.alarmType == "0" ? "系统告警" : "设备告警"
                  }</span>  --
                  <span> ${msg.alarmVal}</span>
                </div>
              `
          });
        }

        if (this.alarmData.length <= 10) {
          this.alarmData.unshift(JSON.parse(frame.body));
        }
        if (this.alarmData.length > 10) {
          this.alarmData.pop();
        }
      }
      // 接收到服务器推送消息，向服务器定义的接收消息routekey路由rk_recivemsg发送确认消息
      // this.client.send("/exchange/topicExchange/topic.temp", {"content-type":"text/plain"}, frame.body);
    },
    connect() {
      this.client = Stomp.client(stompUrl);
      const headers = {
        login: "admin",
        passcode: "admin",
        host: "/",
        "client-id": "alarmMsg"
      };
      //不打印ping pong
      this.client.debug = () => {};
      // 创建连接,放入连接成功和失败回调函数
      this.client.connect(headers, this.onConnected, this.onFailed);
    }
  }
};
</script>

<style scoped>
ul,
li {
  list-style: none;
}
.noticeBadge /deep/ .el-badge__content.is-fixed {
  top: 33%;
}
.right-menu span:nth-of-type(3) {
  height: 100%;
}
.noticeBadge {
  display: flex;
  align-items: center;
  height: 100%;
}
.noticeBadge:hover {
  color: blue;
  cursor: pointer;
}
.el-icon-bell {
  color: #f4f4f4;
}
.navbar /deep/ .el-popover {
  padding: 0 !important;
}
.alarm_popover {
  width: 100% !important;
  height: 100% !important;
  padding: 10px !important;
  background: rgba(0, 0, 0, 0.5);
  color: #f4f4f4;
  cursor: pointer;
}
.alarm_popover:hover {
  color: rgb(27, 82, 82);
}
.alarm_popover_ul li {
  font-size: 14px;
  line-height: 35px;
  border-bottom: 1px solid #e8e8e8;
  cursor: pointer;
}

.alarm_popover_ul li:hover {
  color: blue;
}
.alarm_popover_ul li span {
  margin-right: 5px;
}

.area-text {
  font-size: 14px;
  color: rgb(171 168 168);
  margin-left: 3px;
}
.area-text:hover {
  color: rgb(11, 102, 102);
}

.el-tabs {
  height: 200px;
  overflow: auto;
}

.alarmDetailBtn {
  display: inline-block;
  padding: 3px 5px;
  line-height: 25px;
  background: #2a80eb;
  color: #f4f4f4;
  font-size: 14px;
  margin: 5px auto;
  cursor: pointer;
}
.alarmDetailBtn:hover {
  background: #f4f4f4;
  color: #2a80eb;
}

body >>> .el-popover {
  padding: 10px 5px;
}
.popoverBox >>> .el-tabs__header {
  margin-bottom: 5px;
}
.popoverBox >>> .el-tabs__content {
  height: 77%;
}
.popoverBox >>> .el-tabs__content .el-tab-pane {
  height: 100%;
  overflow-y: auto;
}
.popoverBox >>> .el-tabs__content .el-tab-pane::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 2px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}

.popoverBox >>> .el-tabs__content .el-tab-pane::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #ebebeb;
}

.popoverBox >>> .el-tabs__content .el-tab-pane::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  /* -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2); */
  border-radius: 10px;
  background: #fff;
}
</style>

<style lang="scss" scoped>
.el-dropdown-menu {
  top: 28px !important;
  padding: 3px 0px !important;
}

.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #1f2d3d;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 40px;
    margin-right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 35px;
          height: 35px;
          border-radius: 6px;
          margin-top: 8px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -15px;
          top: 20px;
          font-size: 12px;
          color: #f4f4f4;
        }
      }
    }

    .noticeBadge {
      margin-right: 40px;
      .el-icon-bell {
        font-size: 20px;
        &:hover {
          color: rgb(11, 102, 102);
        }
      }
    }
    .el-tooltip {
      color: #f4f4f4;
      font-size: 20px;
      margin-right: 40px;
      &:hover {
        color: rgb(11, 102, 102);
        cursor: pointer;
      }
    }
  }
}
</style>
