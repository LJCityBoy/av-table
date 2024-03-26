import { App } from "vue";
import AVTable from "./av-table/av-table.vue";

export default {
  install(app: App) {
    app.component("AVTable", AVTable);
  },
};

export { AVTable };

declare module "vue" {
  export interface GlobalComponents {
    AVTable: typeof AVTable;
  }
}
