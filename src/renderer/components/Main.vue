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
  </div>
</template>

<script>
const remote = require("electron").remote;
const { exec } = require("child_process");
var refreshTimer; // 刷新时间定时器

export default {
  name: "app-main",
  data() {
    return {
      date: "",
      time: "",
      functionList: [],
    };
  },
  components: {},
  computed: {},
  mounted() {
    let that = this;

    that.date = that.getCurrentDate();
    that.time = that.getCurrentTime();
    that.startRefreshTime();
    that.functionList = [
      {
        index: 0,
        funcName: "devTools",
        src: "static/img_devTools_icon.png",
        name: "开发者工具",
      },
      {
        index: 1,
        funcName: "oneKeyStartApp",
        src: "static/img_on_duty_icon.png",
        name: "一键启动",
      },
      {
        index: 2,
        funcName: "oneKeyOffDuty",
        src: "static/img_off_duty_icon.png",
        name: "一键下班",
      },
      {
        index: 3,
        funcName: "oneKeyRestart",
        src: "static/img_restart_icon.png",
        name: "一键重启",
      },
    ];
  },
  methods: {
    /** 计算当前年月日 */
    getCurrentDate() {
      let date = new Date();
      let week = [
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
        "星期日",
      ];

      return (
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1) +
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
      let that = _this;

      try {
        if (remote.getCurrentWebContents().isDevToolsOpened())
          remote.getCurrentWebContents().closeDevTools();
        else remote.getCurrentWebContents().openDevTools({ mode: "bottom" });
      } catch (error) {
        console.log("调试模式报错", error);
        that.$notify.error({
          title: "调试模式失败",
          message: "请重启程序试试",
          duration: 0,
        });
      }
    },

    /** 一键启动 */
    oneKeyStartApp(_this) {
      let that = _this;

      try {
        that.destroyRefreshTime();
        that.$router.replace({ name: "app-oneKeyStart" });
      } catch (error) {
        console.log("一键启动失败", error);
        that.$notify.error({
          title: "一键启动失败",
          message: "请打开开发者工具查看原因",
          duration: 0,
        });
      }
    },

    /** 一键下班 */
    oneKeyOffDuty(_this) {
      let that = _this;

      try {
        let command = exec("shutdown -s -t 0", function (err, stdout, stderr) {
          if (err || stderr) {
            console.log("关机失败:" + err + stderr);
          }
        });

        command.stdin.end();
        command.on("close", function (code) {
          console.log("shutdown -s", code);
        });
      } catch (error) {
        console.log("一键下班失败", error);
        that.$notify.error({
          title: "一键下班失败",
          message: "请打开开发者工具查看原因",
          duration: 0,
        });
      }
    },

    /** 一键重启 */
    oneKeyRestart(_this) {
      let that = _this;

      try {
        let command = exec("shutdown -r -t 0", function (err, stdout, stderr) {
          if (err || stderr) {
            console.log("重启失败:" + err + stderr);
          }
        });

        command.stdin.end();
        command.on("close", function (code) {
          console.log("shutdown -r", code);
        });
      } catch (error) {
        console.log("一键重启失败", error);
        that.$notify.error({
          title: "一键重启失败",
          message: "请打开开发者工具查看原因",
          duration: 0,
        });
      }
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
}

.div-time-text {
  position: relative;
  color: #467b73;
  font-size: 80px;
  margin-top: 10px;
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
}

.div-function-cellName {
  position: relative;
  color: #467b73;
  font-size: 12px;
  margin-top: 5px;
}
</style>
