<template>
  <div class="div-newView-page">
    <div class="div-button-area1">
      <el-button
        class="button-open-newView"
        type="primary"
        @click="onClickOpenNewView"
        >打开新页面</el-button
      >
    </div>
  </div>
</template>

<script>
const remote = require("electron").remote;

export default {
  name: "app-newView",
  data() {
    return {};
  },
  components: {},
  computed: {},
  mounted() {},
  methods: {
    /** 点击打开新页面 */
    onClickOpenNewView() {
      remote
        .getCurrentWindow()
        .loadURL("https://xsmjg.fhabc.com/nxsj/xs/index.php?p=1305&v=1");
    },
  },
};
</script>

<style>
.div-newView-page {
  position: relative;
  margin-left: 0px;
  margin-top: 0px;
  min-height: 100vh;
  width: 100%;
  background-color: #fbf2e3;
  display: flex;
  justify-content: center;
}

.div-button-area1 {
  position: absolute;
  display: flex;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
}

.button-open-newView {
  position: relative;
  width: 120px;
  height: 60px;
}
</style>
