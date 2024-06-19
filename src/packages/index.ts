import { App } from "vue";
// import AVTable from "./av-table/av-table.vue";
import NewTable from "./new-table/index.vue";

export default {
  install(app: App) {
    app.component("AVTable", NewTable);
  },
};

export { NewTable };
