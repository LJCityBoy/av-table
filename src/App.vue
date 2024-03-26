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
