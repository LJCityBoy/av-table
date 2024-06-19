<template>
  <div :class="[virtualized && `box-${virtualizedClass}`]">
    <Table
      :data-source="dataSource"
      :class="[virtualized && virtualizedClass]"
      :custom-row="customRowAction"
      v-bind="$attrs"
    >
      <!-- 通过循环去创建，像emptyText这些，obj值为空的，v-bind="obj"会报错，需要过滤 -->
      <template v-for="(__item, key) in $slots" :key="key" #[key]="obj">
        <slot
          v-if="['emptyText', 'summary'].includes(key as string)"
          :name="key"
        ></slot>
        <slot v-else :name="key" v-bind="obj"></slot>
      </template>
    </Table>
  </div>
</template>

<script lang="ts" setup>
import { Table, TableProps } from "ant-design-vue";
import { PropType, onMounted, ref, watch } from "vue";
import { SizeType } from "ant-design-vue/lib/config-provider";

const props = defineProps({
  dataSource: {
    type: Array as PropType<TableProps["dataSource"]>,
    default: () => [],
  },
  itemHeight: {
    type: Number,
    default: 0,
  },
  size: {
    type: String as PropType<SizeType>,
    default: "default",
  },
  virtualized: {
    type: Boolean,
    default: true,
  },
  customRow: {
    type: Function as PropType<TableProps["customRow"]>,
    default: () => {},
  },
});

const parentNode = ref(
  document.querySelector(`.ant-table-body`) as HTMLDivElement
);
const contentNode = ref(
  document.querySelector(`.ant-table-body table`) as HTMLDivElement
);
const placeholderWrapper = ref();
const scrollY = ref(0);
const yItemHeight = ref(0);
//容器高度
const screenHeight = ref(0);
//可视区域数据长度
// const visibleCount = computed(() =>
//   Math.ceil(screenHeight.value / yItemHeight.value)
// );

//随机数生成
function generateUniqueRandomPositiveInteger() {
  const timestamp = new Date().getTime();
  const randomNumber = Math.floor(Math.random() * 1000); // 生成一个随机数，可以根据需求调整范围
  const uniqueRandomNumber = parseInt(
    timestamp.toString() + randomNumber.toString()
  );
  return uniqueRandomNumber;
}

//表格特有class名生成
const virtualizedClass = ref(
  `y-virtualized-${generateUniqueRandomPositiveInteger()}`
);

const initVir = () => {
  if (props.virtualized) {
    //先把容器撑开
    parentNode.value = document.querySelector(
      `.${virtualizedClass.value} .ant-table-body`
    ) as HTMLDivElement;
    contentNode.value = document.querySelector(
      `.${virtualizedClass.value} .ant-table-body table`
    ) as HTMLDivElement;
    if (parentNode.value && contentNode.value) {
      placeholderWrapper.value = document.createElement("div");
      scrollY.value = parentNode.value.clientHeight;
      placeholderWrapper.value.style.height =
        yItemHeight.value * (props.dataSource ? props.dataSource.length : 0) -
        scrollY.value +
        "px";
      parentNode.value.appendChild(placeholderWrapper.value);
      screenHeight.value = parentNode.value.clientHeight;
    }
  }
};

const customRowAction: TableProps["customRow"] = ({ record, index }) => {
  // return index <= 40 ? record : { style: { display: "none" } };
  return (props.customRow as Function)(record, index)
};

onMounted(() => {
  initVir();
});

watch(
  () => props.size,
  (val) => {
    if (props.itemHeight === 0 && val === ("default" as SizeType)) {
      yItemHeight.value = 55;
    } else if (props.itemHeight === 0 && val === ("middle" as SizeType)) {
      yItemHeight.value = 47;
    } else if (props.itemHeight === 0 && val === ("small" as SizeType)) {
      yItemHeight.value = 39;
    } else if (props.itemHeight !== 0) {
      //优先使用用户传进来的yItemHeight
      yItemHeight.value = props.itemHeight;
    }
  },
  {
    deep: true,
    immediate: true,
  }
);
</script>
