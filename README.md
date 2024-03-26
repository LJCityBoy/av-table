# 居于ant-design-vue封装的虚拟列表组件

## 说明
* av-table是居于ant-design-vue（版本3.2.20） 的 a-table组件封装的虚拟列表组件。
    av-table组件继承了a-table的所有属性和方法，用户在使用的时候可以直接参照a-table的api文档进行开发，
    当然该虚拟列表组件新增了两个a-table没有的关键属性，需要使用者特别注意的，具体属性会在下面注明。
* 使用前一定要安装ant-design-vue(版本3.2.20)依赖
* 使用过程中，可能要传一下table的scroll.y，其中av-table的scroll参数与a-table的scroll参数一致
（ <a href="https://3x.antdv.com/components/table-cn">原 ant-design-vue a-table 组件 API 传送地址点这里</a>）


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
    <AVTable
      :dataSource="dataSource"
      :virtualized="true"
      :columns="columns"
      :scroll="{ y: '400px' }"
      :pagination="false"
    ></AVTable>
  </div>
</template>

<script setup>
const dataSource = Array.from(
  Array(1000).fill({
    key: "1",
    name: "蒋哥哥",
    age: 18,
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
    title: "特征",
    dataIndex: "tag",
    key: "tag",
  },
  {
    title: "工作单位",
    dataIndex: "address",
    key: "address",
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
  height: 100%;
}
</style>

```