import { createApp } from "vue";
//记得引入antd.css，否则会样式丢失
import "ant-design-vue/dist/antd.css";
import App from "./App.vue";
import AVTable from "av-table";

createApp(App).use(AVTable).mount("#app");
