<template>
  <div class="div-main-page">
    <div class="div-clock-area">
      <div class="div-date-text">{{ date }}</div>
      <div class="div-time-text">{{ time }}</div>
    </div>
    <div v-if="functionList.length != 0" class="div-function-area">
      <div v-for="item in functionList" :key="item.index">
        <div class="div-function-cell">
          <el-image
            @click="onClickFunctionCell(item.funcName)"
            class="image-function-cellIcon"
            :src="item.src"
            lazy
          ></el-image>
          <div class="div-function-cellName">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div class="div-work-time-area">上班时间: {{ workTime }}</div>
    <div class="div-version-area">v0.0.1</div>
    <div v-if="showPop" class="div-page-mask">
      <el-progress type="circle" :percentage="popProgress" status="warning"></el-progress>
      <div class="div-pop-text">{{ popTip }}</div>
      <el-button
        class="button-pop-event"
        type="warning"
        round
        @click="onClickFunctionCell(popEvent)"
        >取消</el-button
      >
    </div>
  </div>
</template>

<script>
const remote = require("electron").remote;
const { exec } = require("child_process");
const startWorkTimeCacheName = "startWorkTime";
var refreshTimer; // 刷新时间定时器
var popTimer; // 弹窗定时器

export default {
  name: "app-main",
  data() {
    return {
      date: "",
      time: "",
      functionList: [],
      workTime: localStorage.getItem(startWorkTimeCacheName)
        ? localStorage.getItem(startWorkTimeCacheName)
        : "",
      showPop: false,
      popProgress: 0,
      popTip: "",
      popEvent: "",
    };
  },
  components: {},
  computed: {},
  mounted() {
    let that = this;

    that.date = that.getCurrentDate();
    that.time = that.getCurrentTime();
    that.startRefreshTime();
    that.checkWorkTime();
    that.functionList = [
      {
        index: 0,
        funcName: "devTools",
        src: "static/img_devTools_icon.png",
        name: "开发者工具",
      },
      {
        index: 1,
        funcName: "onClickPunchIn",
        src: "static/img_punch_in_icon.png",
        name: "上班打卡",
      },
      {
        index: 2,
        funcName: "oneKeyStartApp",
        src: "static/img_on_duty_icon.png",
        name: "一键启动",
      },
      {
        index: 3,
        funcName: "timeRecord",
        src: "static/img_time_record_icon.png",
        name: "工时记录",
      },
      {
        index: 4,
        funcName: "oneKeyOffDuty",
        src: "static/img_off_duty_icon.png",
        name: "一键下班",
      },
    ];
  },
  methods: {
    /** 计算当前年月日 */
    getCurrentDate() {
      let date = new Date();
      let week = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];

      return (
        date.getFullYear() +
        "-" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + date.getDate()).slice(-2) +
        " " +
        week[date.getDay()]
      );
    },

    /** 计算当前时间 */
    getCurrentTime() {
      let date = new Date();

      return (
        ("0" + date.getHours()).slice(-2) +
        ":" +
        ("0" + date.getMinutes()).slice(-2) +
        ":" +
        ("0" + date.getSeconds()).slice(-2)
      );
    },

    /** 检测上班时间 */
    checkWorkTime() {
      let that = this;

      if (!that.workTime) return;
      let curDate = that.date;
      let workTime = that.workTime;

      if (
        workTime.slice(0, workTime.length - 8) != curDate.slice(0, curDate.length - 3)
      ) {
        that.workTime = "";
        localStorage.setItem(startWorkTimeCacheName, "");
      }
    },

    /** 启用刷新时间的定时器 */
    startRefreshTime() {
      let that = this;

      refreshTimer = setInterval(function () {
        that.date = that.getCurrentDate();
        that.time = that.getCurrentTime();
      }, 1000);
    },

    /** 销毁刷新时间的定时器 */
    destroyRefreshTime() {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = undefined;
      }
    },

    /**
     * 点击功能单元事件
     * @param {String} funcName 方法名
     */
    onClickFunctionCell(funcName) {
      const that = this;
      let methods = that.$options.methods;

      console.log(that.time + ":" + funcName);
      methods[funcName](that);
    },

    /** 开发者工具 */
    devTools(_this) {
      if (remote.getCurrentWebContents().isDevToolsOpened())
        remote.getCurrentWebContents().closeDevTools();
      else remote.getCurrentWebContents().openDevTools({ mode: "right" });
    },

    /** 上班打卡 */
    onClickPunchIn(_this) {
      let that = _this;
      let date = that.date;
      let time = that.time;

      if (that.workTime) {
        if (
          that.workTime.slice(0, that.workTime.length - 9) ===
          date.slice(0, date.length - 4)
        ) {
          that.$notify({
            title: "上班打卡重复",
            message: "今天已经打过卡了呢，亲~",
            duration: 0,
          });
          return;
        }
      }
      that.workTime = date.slice(0, date.length - 3) + time;
      localStorage.setItem(startWorkTimeCacheName, that.workTime);
    },

    /** 一键启动 */
    oneKeyStartApp(_this) {
      let that = _this;

      that.destroyRefreshTime();
      that.$router.replace({ name: "app-oneKeyStart" });
    },

    /** 检测是否到下班点 */
    checkOffDutyTime() {
      let that = this;

      if (!that.workTime) return true;
      if (new Date().getTime() - new Date(that.workTime).getTime() < 32400000)
        return false;
      else return true;
    },

    /** 一键下班 */
    oneKeyOffDuty(_this) {
      let that = _this;

      if (!that.checkOffDutyTime()) {
        that.$notify({
          title: "一键下班失败",
          message: "还没到点呢，亲~",
          duration: 0,
        });
        return;
      }
      that.showPop = true;
      that.popTip = "关机倒计时";
      that.popEvent = "destroyPopTimer";
      popTimer = setInterval(() => {
        if (that.popProgress >= 100) {
          clearInterval(popTimer);
          popTimer = undefined;
          that.showPop = false;
          that.popProgress = 0;
          that.popTip = "";
          that.popEvent = "";
          that.shutdownWindows();
        }
        that.popProgress += 10;
      }, 500);
    },

    /** 取消弹窗定时器 */
    destroyPopTimer(_this) {
      let that = _this;

      clearInterval(popTimer);
      popTimer = undefined;
      that.showPop = false;
      that.popProgress = 0;
      that.popTip = "";
      that.popEvent = "";
    },

    /** 关机 */
    shutdownWindows() {
      let command = exec("shutdown -s -t 0", function (err, stdout, stderr) {
        if (err || stderr) {
          console.log("关机失败:" + err + stderr);
        }
      });

      command.stdin.end();
      command.on("close", function (code) {
        console.log("shutdown -s", code);
      });
    },

    /** 工时记录 */
    timeRecord(_this) {
      let that = _this;

      that.destroyRefreshTime();
      that.$router.replace({ name: "app-timeRecord" });
    },
  },
};
</script>

<style>
.div-main-page {
  position: relative;
  margin-left: 0px;
  margin-top: 0px;
  min-height: 100vh;
  width: 100%;
  background-color: #fbf2e3;
}

.div-clock-area {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.div-date-text {
  position: relative;
  color: #467b73;
  font-size: 20px;
  margin-top: 10px;
  user-select: none;
  cursor: default;
}

.div-time-text {
  position: relative;
  color: #467b73;
  font-size: 80px;
  margin-top: 10px;
  user-select: none;
  cursor: default;
}

.div-function-area {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  overflow: hidden;
}

.div-function-cell {
  position: relative;
  margin: 20px 0 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-function-cellIcon {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  user-select: none;
}

.div-function-cellName {
  position: relative;
  color: #467b73;
  font-size: 12px;
  margin-top: 5px;
  user-select: none;
  cursor: default;
}

.div-work-time-area {
  position: absolute;
  color: #467b73;
  font-size: 15px;
  bottom: 10px;
  left: 10px;
  user-select: none;
  cursor: default;
}

.div-version-area {
  position: absolute;
  color: #467b73;
  font-size: 15px;
  bottom: 10px;
  right: 10px;
  user-select: none;
  cursor: default;
}

.div-page-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.div-pop-text {
  position: relative;
  color: #fff;
  margin-top: 15px;
}

.button-pop-event {
  position: relative;
  margin-top: 30px;
}
</style>
