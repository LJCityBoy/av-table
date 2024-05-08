<template>
  <div id="app">
    <a-divider><h1>示例1</h1></a-divider>
    <AVTable
      :dataSource="dataSource"
      :virtualized="true"
      :columns="columns"
      :scroll="{ y: '400px' }"
      :pagination="false"
      row-key="key"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
        fixed: 'left',
        type: 'checkbox',
        checkStrictly: false,
      }"
    >
      <template #bodyCell="{ column }">
        <template v-if="column.dataIndex === 'operation'">
          <a>Publish</a>
        </template>
      </template>
    </AVTable>
    <a-divider><h1>示例2</h1></a-divider>
    <AVTable
      :data-source="dataSource"
      :columns="columns"
      :pagination="false"
      :virtualized="true"
      :scroll="{ y: '400px' }"
      :bordered="true"
      row-key="key"
      @resize-column="handleResizeColumn"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a-input v-model:value="record[column.dataIndex]" />
        </template>
        <template v-else-if="column.dataIndex === 'age'">
          <a-input-number v-model:value="record[column.dataIndex]" />
        </template>
        <template v-else-if="column.dataIndex === 'joinDate'">
          <a-date-picker v-model:value="record[column.dataIndex]" />
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <a>这是操作按钮</a>
        </template>
        <template v-else>
          <span>{{ text }}</span>
        </template>
      </template>
    </AVTable>
    <a-divider><h1>示例3</h1></a-divider>
    <AVTable
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :virtualized="true"
      :scroll="{ y: '400px' }"
      :bordered="true"
      row-key="key"
      class="components-table-demo-nested"
    >
      <template #bodyCell="{ column }">
        <template v-if="column.dataIndex === 'operation'">
          <a>按钮</a>
        </template>
      </template>
      <template #expandedRowRender>
        <AVTable
          :columns="innerColumns"
          :data-source="innerData"
          :pagination="false"
        >
          <template #bodyCell="{ column }">
            <template v-if="column.key === 'state'">
              <span>
                <a-badge status="success" />
                Finished
              </span>
            </template>
            <template v-else-if="column.key === 'operation'">
              <span class="table-operation">
                <a>Pause</a>
                <a>Stop</a>
                <a-dropdown>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item>Action 1</a-menu-item>
                      <a-menu-item>Action 2</a-menu-item>
                    </a-menu>
                  </template>
                  <a>
                    More
                    <down-outlined />
                  </a>
                </a-dropdown>
              </span>
            </template>
          </template>
        </AVTable>
      </template>
    </AVTable>
    <a-divider><h1>其他示例自己看ant-design-vue,谢谢！</h1></a-divider>
  </div>
</template>

<script setup lang="ts">
import {
  Input as AInput,
  DatePicker as ADatePicker,
  InputNumber as AInputNumber,
  Badge as ABadge,
  Dropdown as ADropdown,
  Menu as AMenu,
  MenuItem as AMenuItem,
  Divider as ADivider,
} from "ant-design-vue";
import { DownOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { AVTable } from "./packages/index";
import { Ref, ref } from "vue";
import { Key } from "ant-design-vue/lib/table/interface";

const dataSource = Array.from(
  Array(1000).fill({
    key: "1",
    name: "蒋哥哥",
    age: 18,
    joinDate: dayjs("2020-10-20", "YYYY-MM-DD"),
    address: "东莞xxxX电子厂",
    tag: "宇宙无敌帅气",
  }),
  (item, index) => ({ ...item, name: `${item.name}${index}`, key: index })
);

const columns = [
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "年龄",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "入职日期",
    dataIndex: "joinDate",
    key: "joinDate",
    width: 180,
    resizable: true,
  },
  {
    title: "特征",
    dataIndex: "tag",
    key: "tag",
  },
  {
    title: "工作单位",
    dataIndex: "address",
    key: "address",
  },
  { title: "操作", dataIndex: "operation", key: "operation" },
];

const innerData = Array.from(
  Array(4).fill({
    key: 1,
    date: "2014-12-24 23:12:00",
    name: `阿蒋`,
    upgradeNum: "Upgraded: 56",
  }),
  (item, index) => ({ ...item, name: `${item.name}${index}`, key: index })
);

const innerColumns = [
  { title: "Date", dataIndex: "date", key: "date" },
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Status", key: "state" },
  { title: "Upgrade Status", dataIndex: "upgradeNum", key: "upgradeNum" },
  {
    title: "Action",
    dataIndex: "operation",
    key: "operation",
  },
];

const selectedRowKeys: Ref<Key[]> = ref([]);

const handleResizeColumn = () => {};

const onSelectChange = (selectKeys: Key[], __selectKeysRow: any[]) => {
  __selectKeysRow;
  selectedRowKeys.value = selectKeys;
};
</script>

<style scoped>
html {
  height: 100%;
}
body {
  height: 100%;
  margin: 0;
}
#app {
  width: 1200px;
  margin: 0 auto;
  height: 100%;
}
</style>
