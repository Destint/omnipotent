<template>
  <div class="div-oneKeyStart-page">
    <div class="div-current-selection-area">
      <div class="text-current-selection-tip">当前启动项:</div>
      <div v-if="startAppList.length != 0">
        <div v-for="item in startAppList" :key="item.index">
          <div class="text-startApp-name">
            {{ item.index + 1 + "、" + item.name }}
            <el-image
              @click="onClickDeleteStartAppCell(item.index)"
              class="image-delete-icon"
              src="static/img_delete_icon.png"
              lazy
            ></el-image>
          </div>
        </div>
      </div>
      <input type="file" id="chooseFile" style="display: none" />
    </div>
    <div class="div-button-area">
      <el-button class="button-choose-file" type="primary" @click="onClickChooseFile"
        >选择启动项</el-button
      >
      <el-button class="button-choose-file" type="success" @click="onClickOneKeyStart"
        >一键启动</el-button
      >
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
const startAppListCacheName = "startAppList";
const { exec } = require("child_process");

export default {
  name: "app-oneKeyStart",
  data() {
    return {
      startAppList: localStorage.getItem(startAppListCacheName)
        ? JSON.parse(localStorage.getItem(startAppListCacheName))
        : [],
    };
  },
  components: {},
  computed: {},
  mounted() {
    let that = this;
    let chooseFile = document.getElementById("chooseFile");

    if (chooseFile) {
      chooseFile.addEventListener("change", (e) => {
        let file = e.target.files[0];
        console.log("选中的文件", file);
        if (file && file.name.indexOf(".exe") != -1) {
          let startAppList = that.startAppList;

          for (let i = 0; i < startAppList.length; i++) {
            if (startAppList[i].name === file.name.slice(0, file.name.length - 4)) return;
          }
          startAppList.push({
            index: startAppList.length,
            name: file.name.slice(0, file.name.length - 4),
            path: file.path,
          });
          localStorage.setItem(startAppListCacheName, JSON.stringify(startAppList));
          that.startAppList = startAppList;
        } else {
          that.$notify.error({
            title: "选择启动项失败",
            message: "请选择exe程序",
            duration: 1500,
          });
        }
      });
    }
  },
  methods: {
    /** 点击返回主页 */
    onClickGoHome() {
      this.$router.replace({ name: "app-main" });
    },

    /** 点击选择启动项 */
    onClickChooseFile() {
      let chooseFile = document.getElementById("chooseFile");

      if (!chooseFile) return;
      chooseFile.value = "";
      chooseFile.click();
    },

    /** 点击一键启动 */
    onClickOneKeyStart() {
      let that = this;
      let startAppList = localStorage.getItem(startAppListCacheName)
        ? JSON.parse(localStorage.getItem(startAppListCacheName))
        : [];

      if (startAppList.length === 0) {
        that.$notify({
          title: "当前无启动项",
          message: "请点击选择启动项添加",
          duration: 1500,
        });

        return;
      }
      for (let i = 0; i < startAppList.length; i++) {
        let filePath = startAppList[i].path.replace(/\\/g, "\\\\");

        exec(JSON.stringify(filePath));
      }
    },

    /**
     * 点击删除启动项单元
     * @param {Number} index 启动项列表索引
     */
    onClickDeleteStartAppCell(index) {
      let that = this;
      let startAppList = localStorage.getItem(startAppListCacheName)
        ? JSON.parse(localStorage.getItem(startAppListCacheName))
        : [];

      startAppList.splice(index, 1);
      for (let i = 0; i < startAppList.length; i++) {
        startAppList[i].index = i;
      }
      console.log("删除启动项", startAppList);
      localStorage.setItem(startAppListCacheName, JSON.stringify(startAppList));
      that.startAppList = startAppList;
    },
  },
};
</script>

<style>
.div-oneKeyStart-page {
  position: relative;
  margin-left: 0px;
  margin-top: 0px;
  min-height: 100vh;
  width: 100%;
  background-color: #fbf2e3;
}

.div-current-selection-area {
  position: relative;
  width: 100%;
  margin-top: 0px;
  margin-left: 0px;
  overflow: hidden;
}

.text-current-selection-tip {
  position: relative;
  font-size: 20px;
  margin-left: 10px;
  margin-top: 10px;
  color: #467b73;
  user-select: none;
  cursor: default;
}

.text-startApp-name {
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

.div-button-area {
  position: absolute;
  display: flex;
  bottom: 140px;
  left: 50%;
  transform: translateX(-50%);
}

.button-choose-file {
  position: relative;
  width: 120px;
  height: 60px;
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

.image-delete-icon {
  position: relative;
  margin-left: 10px;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  user-select: none;
}
</style>
