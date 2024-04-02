# 居于ant-design-vue封装的虚拟列表组件av-table

## av-table亮点
* 开箱即用，不破坏antd原有a-table的所有属性和方法，不破坏布局
* 能加载10W级别以上的数据而不卡顿
* 最重要的是，可以无缝移植到原有的居于ant-design-vue（3.2.20版本）项目中

## 源码地址
<a href="https://github.com/LJCityBoy/av-table">源码地址点这里</a>

<a href="https://www.npmjs.com/package/av-table?activeTab=readme">npm包下载地址</a>

<a href="http://110.41.134.38/av-table/index.html">av-table在线演示地址</a>

## 简介
* 用ant-design-vue的用户可能会遇到过一些性能上的烦恼：当页面中表格数据量达到一定量级的时候，滚动页面会变得非常卡顿。由于开发过程中疏忽了卡顿问题，等到项目进度已经100%的时候再回头去优化，发现如果要替换掉项目中原有的a-table代码改动量大，时间成本特别高，还存在一定的未知风险。未来解决这个烦恼，本人稍微改动了一下a-table，使其加载10w条数据也不会出现卡顿。所以，av-table就出现了。
* av-table是居于ant-design-vue（版本3.2.20） 的 a-table组件封装的虚拟列表组件。
    av-table组件继承了a-table的所有属性和方法，用户在使用的时候可以直接参照a-table的api文档进行开发，
    当然该虚拟列表组件新增了两个a-table没有的关键属性，需要使用者特别注意的，具体属性会在下面注明。
* 使用前一定要安装ant-design-vue(版本3.2.20)依赖
* 使用过程中，可能要传一下table的scroll.y，其中av-table的scroll参数与a-table的scroll参数一致
（ <a href="https://3x.antdv.com/components/table-cn">原 ant-design-vue a-table 组件 API 传送地址点这里</a>）
## 原理
* 简单说一下原理吧，请看下图：

![本地路径](/src/assets/原理.jpg)

## 额外新增两个参数如下：
|    参数     |                                                                           说明                                                                            |  类型  | 默认值 | 是否必填 |
| :---------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------: | :----: | :----: | :------: |
| virtualized |                                                                   是否开启虚拟列表功能                                                                    | boole  | false  |    否    |
| itemHeight  | 行高设置，当传入该值时，虚拟列表会优先根据该行高进行计算，当用户不传该值时，会根据 size 值选择行高，分别对应关系为：default = 55， middle = 47 small = 39 | number |   0    |    否    |


## 使用示例代码

### main.ts代码如下
```ts
import { createApp } from "vue";
//记得引入antd.css，否则会样式丢失
import "ant-design-vue/dist/antd.css";
import App from "./App.vue";
import AVTable from "av-table";

createApp(App).use(AVTable).mount("#app");
```

### App.vue代码如下
```ts
<template>
  <div id="app">
    <a-divider><h1>示例1</h1></a-divider>
    <AVTable
      :dataSource="dataSource"
      :virtualized="true"
      :columns="columns"
      :scroll="{ y: '400px' }"
      :pagination="false"
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

<script setup>
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


```