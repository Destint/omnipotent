<template>
  <div class="div-timeRecord-page">
    <div class="div-current-timeRecord-area">
      <div class="text-current-timeRecord-tip">当前工作项:</div>
      <div v-if="timeList.length != 0" class="div-current-timeRecord-list">
        <div v-for="item in timeList" :key="item.index">
          <div class="text-timeRecord-item">
            {{
              item.index +
              1 +
              ": " +
              item.time +
              " 《" +
              item.content +
              "》 " +
              item.stateDes +
              " " +
              (item.durationDes ? item.durationDes : "")
            }}
          </div>
        </div>
      </div>
    </div>
    <div class="div-record-area">
      <div v-if="!timeList.length || timeList[timeList.length - 1].state === 4">
        <el-button
          type="danger"
          @click="onClickEmptyWork"
          style="width: 100px; height: 40px; margin-right: 10px"
          >清空记录</el-button
        >
        <el-input
          v-model="workInput"
          placeholder="请输入工作内容"
          style="width: 200px;"
        ></el-input>
        <el-button
          type="primary"
          @click="onClickStartWork"
          style="width: 120px; height: 60px; margin-left: 10px"
          >开始工作</el-button
        >
      </div>
      <div v-else style="display: flex">
        <div v-if="timeList[timeList.length - 1].state !== 2">
          <el-button
            type="warning"
            @click="onClickPauseWork"
            style="width: 120px; height: 60px; margin-left: 10px"
            >暂停工作</el-button
          >
        </div>
        <div v-if="timeList[timeList.length - 1].state === 2">
          <el-button
            type="warning"
            @click="onClickContinueWork"
            style="width: 120px; height: 60px; margin-left: 10px"
            >继续工作</el-button
          >
        </div>
        <el-button
          type="success"
          @click="onClickFinishWork"
          style="width: 120px; height: 60px; margin-left: 10px"
          >结束工作</el-button
        >
      </div>
    </div>
    <div class="div-home-area">
      <el-image
        @click="onClickGoHome"
        class="image-home-icon"
        src="static/img_home_icon.png"
        lazy
      ></el-image>
    </div>
  </div>
</template>

<script>
import { Timeline } from "element-ui";

const timeRecordeCacheName = "timeRecorde";

export default {
  name: "app-timeRecord",
  data() {
    return {
      timeList: localStorage.getItem(timeRecordeCacheName)
        ? JSON.parse(localStorage.getItem(timeRecordeCacheName))
        : [],
      workInput: "",
    };
  },
  components: {},
  computed: {},
  mounted() {
    let that = this;

    that.keepBottomDisplay();
  },
  methods: {
    /** 计算当前年月日 */
    getCurrentDate() {
      let date = new Date();

      return (
        date.getFullYear() +
        "-" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + date.getDate()).slice(-2)
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

    /** 转换秒时间戳单位 */
    getDurationDes(duration) {
      let timeDes = "";

      if (duration < 60) {
        timeDes = parseInt(duration) + "秒";
      } else if (duration < 3600) {
        let m = parseInt(duration / 60);
        let s = parseInt(duration % 60);

        timeDes = m + "分" + s + "秒";
      } else if (duration < 86400) {
        let h = parseInt(duration / 3600);
        let m = parseInt((duration - h * 3600) / 60);

        timeDes = h + "小时" + m + "分";
      } else if (duration >= 86400) {
        let d = parseInt(duration / 86400);
        let h = parseInt((duration - day * 86400) / 3600);

        timeDes = d + "天" + h + "小时";
      }

      return timeDes;
    },

    /** 点击返回主页 */
    onClickGoHome() {
      this.$router.replace({ name: "app-main" });
    },

    /** 保持记录列表显示最新 */
    keepBottomDisplay() {
      let divscll = document.getElementsByClassName("div-current-timeRecord-list"); // 装消息的div

      if (divscll && divscll[0] && divscll[0].scrollHeight)
        divscll[0].scrollTop = divscll[0].scrollHeight;
    },

    /** 点击清空工作 */
    onClickEmptyWork() {
      let that = this;

      if (!that.timeList || !that.timeList.length) {
        that.$notify({
          title: "当前无工作记录",
          message: "请先开始工作",
          duration: 1500,
        });
        return;
      }
      that.timeList = [];
      localStorage.setItem(timeRecordeCacheName, JSON.stringify(that.timeList));
    },

    /** 点击开始工作 */
    onClickStartWork() {
      let that = this;
      let workContent = that.workInput;

      if (!workContent) {
        that.$notify({
          title: "当前无工作内容",
          message: "请先输入工作内容",
          duration: 1500,
        });
        return;
      }
      let timeList = that.timeList;

      timeList.push({
        index: timeList.length,
        time: that.getCurrentDate() + " " + that.getCurrentTime(),
        content: workContent,
        state: 1, // 1 开始 2 暂停 3 继续 4 结束
        stateDes: "开始",
      });
      that.timeList = timeList;
      that.workInput = "";
      localStorage.setItem(timeRecordeCacheName, JSON.stringify(timeList));
      setTimeout(() => {
        that.keepBottomDisplay();
      });
    },

    /** 点击暂停工作 */
    onClickPauseWork() {
      let that = this;
      let timeList = that.timeList;
      let currentTime = that.getCurrentDate() + " " + that.getCurrentTime();
      let sTime = new Date(timeList[timeList.length - 1].time).getTime();
      let eTime = new Date(currentTime).getTime();
      let duration = eTime / 1000 - sTime / 1000;
      let durationDes = that.handleDuration(timeList, duration);

      timeList.push({
        index: timeList.length,
        time: currentTime,
        content: timeList[timeList.length - 1].content,
        state: 2,
        stateDes: "暂停",
        duration: duration,
        durationDes: "共计耗时: " + durationDes,
      });
      that.timeList = timeList;
      localStorage.setItem(timeRecordeCacheName, JSON.stringify(timeList));
      setTimeout(() => {
        that.keepBottomDisplay();
      });
    },

    /** 点击继续工作 */
    onClickContinueWork() {
      let that = this;
      let timeList = that.timeList;

      timeList.push({
        index: timeList.length,
        time: that.getCurrentDate() + " " + that.getCurrentTime(),
        content: timeList[timeList.length - 1].content,
        state: 3,
        stateDes: "继续",
      });
      that.timeList = timeList;
      localStorage.setItem(timeRecordeCacheName, JSON.stringify(timeList));
      setTimeout(() => {
        that.keepBottomDisplay();
      });
    },

    /** 点击结束工作 */
    onClickFinishWork() {
      let that = this;
      let timeList = that.timeList;
      let duration = 0;
      let durationDes = "";

      if (timeList[timeList.length - 1].state !== 2) {
        let currentTime = that.getCurrentDate() + " " + that.getCurrentTime();
        let sTime = new Date(timeList[timeList.length - 1].time).getTime();
        let eTime = new Date(currentTime).getTime();

        duration = eTime / 1000 - sTime / 1000;
      }
      durationDes = that.handleDuration(timeList, duration);
      timeList.push({
        index: timeList.length,
        time: that.getCurrentDate() + " " + that.getCurrentTime(),
        content: timeList[timeList.length - 1].content,
        state: 4,
        duration: duration,
        durationDes: "共计耗时: " + durationDes,
        stateDes: "结束",
      });
      that.timeList = timeList;
      localStorage.setItem(timeRecordeCacheName, JSON.stringify(timeList));
      setTimeout(() => {
        that.keepBottomDisplay();
      });
    },

    /** 计算当前工作共计耗时 */
    handleDuration(timeList, duration) {
      let that = this;
      let durationDes;

      for (let i = timeList.length - 1; i >= 0; i--) {
        if (timeList[i].state === 1) break;
        if (timeList[i].duration) duration += timeList[i].duration;
      }
      durationDes = that.getDurationDes(duration);
      return durationDes;
    },
  },
};
</script>

<style>
.div-timeRecord-page {
  position: relative;
  margin-left: 0px;
  margin-top: 0px;
  min-height: 100vh;
  width: 100%;
  background-color: #fbf2e3;
}

.div-current-timeRecord-area {
  position: absolute;
  width: 100%;
  top: 0px;
  left: 0px;
  bottom: 220px;
  overflow: hidden;
}

.text-current-timeRecord-tip {
  position: relative;
  font-size: 20px;
  margin-left: 10px;
  margin-top: 10px;
  color: #467b73;
  user-select: none;
  cursor: default;
}

.div-current-timeRecord-list {
  position: absolute;
  left: 0px;
  top: 40px;
  bottom: 0px;
  right: 0px;
  overflow-y: auto;
}

.text-timeRecord-item {
  position: relative;
  font-size: 18px;
  margin-left: 15px;
  margin-top: 5px;
  color: #467b73;
  display: flex;
  align-items: center;
  user-select: none;
  cursor: default;
}

.div-record-area {
  position: absolute;
  width: 100%;
  bottom: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.div-home-area {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
}

.image-home-icon {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  user-select: none;
}
</style>
