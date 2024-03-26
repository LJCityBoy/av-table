<template>
  <div :class="[virtualized && `box-${virtualizedClass}`]">
    <v-table
      :data-source="renderList"
      :size="size"
      v-bind="$attrs"
      :class="[virtualized && virtualizedClass]"
    >
      <!-- 通过循环去创建，像emptyText这些，obj值为空的，v-bind="obj"会报错，需要过滤 -->
      <template v-for="(__item, key) in $slots" :key="key" #[key]="obj">
        <slot
          v-if="['emptyText', 'summary', 'customFilterDropdown'].includes(key as string)"
          :name="key"
        ></slot>
        <!-- 处理切割后序号不连续问题 -->
        <slot
          v-else-if="['bodyCell'].includes(key as string)"
          :name="key"
          v-bind="{ ...obj, index: range[0] + obj.index }"
        ></slot>
        <slot v-else :name="key" v-bind="obj"></slot>
      </template>
    </v-table>
  </div>
</template>

<script lang="ts" setup>
import { Table as VTable } from "ant-design-vue";
import { SizeType } from "ant-design-vue/lib/config-provider";
import {
  onMounted,
  onUnmounted,
  ref,
  computed,
  PropType,
  watch,
  useAttrs,
} from "vue";

interface ScrollType {
  x: string | number | true;
  y: string | number;
  scrollToFirstRowOnChange: boolean;
}

const props = defineProps({
  dataSource: {
    type: Array,
    default: () => [],
  },
  virtualized: {
    type: Boolean,
    default: false,
  },
  itemHeight: {
    type: Number,
    default: 0,
  },
  size: {
    type: String as PropType<SizeType>,
    default: "default",
  },
});

const attrs = useAttrs();

const yItemHeight = ref(0);

//表格特有class名生成
const virtualizedClass = ref(
  `y-virtualized-${generateUniqueRandomPositiveInteger()}`
);

const range = ref([0, 50]);

//容器高度
const screenHeight = ref(0);

//可视区域数据长度
const visibleCount = computed(() =>
  Math.ceil(screenHeight.value / yItemHeight.value)
);

const parentNode = ref(
  document.querySelector(`.ant-table-body`) as HTMLDivElement
);
const contentNode = ref(
  document.querySelector(`.ant-table-body table`) as HTMLDivElement
);

const placeholderWrapper = ref();

const scrollY = ref(0);

const currentHeight = ref(0);

const renderList = computed(() => {
  if (props.virtualized) {
    const [start, end] = range.value;
    return props.dataSource.slice(
      start,
      Math.min(end, props.dataSource.length)
    );
  } else {
    return props.dataSource;
  }
});

//滚动触发时切割数据
const scrollEvent = () => {
  screenHeight.value = parentNode.value.clientHeight;
  const startIdx = Math.floor(parentNode.value.scrollTop / yItemHeight.value);
  const endIdx = startIdx + visibleCount.value;
  range.value = [startIdx, endIdx];
  const offset =
    parentNode.value.scrollTop -
    (parentNode.value.scrollTop % yItemHeight.value);
  contentNode.value.style.transform = `translate3d(0, ${offset}px, 0)`;
};

const initVir = () => {
  if (props.virtualized) {
    parentNode.value = document.querySelector(
      `.${virtualizedClass.value} .ant-table-body`
    ) as HTMLDivElement;
    contentNode.value = document.querySelector(
      `.${virtualizedClass.value} .ant-table-body table`
    ) as HTMLDivElement;
    placeholderWrapper.value = document.createElement("div");
    if (
      attrs &&
      Object.prototype.hasOwnProperty.call(attrs, "scroll") &&
      Object.prototype.hasOwnProperty.call(attrs.scroll, "y")
    ) {
      scrollY.value = scrollY2Number((attrs.scroll as ScrollType).y);
    }
    placeholderWrapper.value.style.height =
      yItemHeight.value * props.dataSource.length - scrollY.value + "px";
    parentNode.value.appendChild(placeholderWrapper.value);
    screenHeight.value = parentNode.value.clientHeight;
    parentNode.value.addEventListener("scroll", scrollEvent);
  }
};
//单位转换
const scrollY2Number = (sy: string | number) => {
  if (typeof sy === "string" && sy.endsWith("%")) {
    const num = Number(sy.slice(0, sy.length - 1));
    const parentElement = document.querySelector(
      `.box-${virtualizedClass.value}`
    ) as HTMLDivElement; // 获取父元素
    return (num / 100) * parentElement.offsetHeight;
  } else if (typeof sy === "string" && sy.endsWith("rem")) {
    const num = Number(sy.slice(0, sy.length - 3));
    return (
      num *
      parseFloat(window.getComputedStyle(document.documentElement).fontSize)
    );
  } else if (typeof sy === "string" && sy.endsWith("vh")) {
    const num = Number(sy.slice(0, sy.length - 2));
    return (num / 100) * document.body.offsetHeight;
  } else if (typeof sy === "string" && sy.endsWith("px")) {
    const num = Number(sy.slice(0, sy.length - 2));
    return Number(num);
  } else {
    return Number(sy);
  }
};

onMounted(() => {
  initVir();
  const observer = new MutationObserver(() => {
    if (currentHeight.value !== parentNode.value.clientHeight) {
      if (
        attrs &&
        Object.prototype.hasOwnProperty.call(attrs, "scroll") &&
        Object.prototype.hasOwnProperty.call(attrs.scroll, "y")
      ) {
        scrollY.value = scrollY2Number((attrs.scroll as ScrollType).y);
        placeholderWrapper.value.style.height =
          yItemHeight.value * props.dataSource.length - scrollY.value + "px";
      }
      currentHeight.value = parentNode.value.clientHeight;
      screenHeight.value = parentNode.value.clientHeight;
      const startIdx = Math.floor(
        parentNode.value.scrollTop / yItemHeight.value
      );
      const endIdx = startIdx + visibleCount.value;
      range.value = [startIdx, endIdx];
      //计算偏移量，让数据在可视区内
      const offset =
        parentNode.value.scrollTop -
        (parentNode.value.scrollTop % yItemHeight.value);
      contentNode.value.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
  });
  observer.observe(parentNode.value, {
    attributes: true,
    childList: true,
    subtree: true,
  });
});

onUnmounted(() => {
  if (props.virtualized) {
    parentNode.value.removeChild(placeholderWrapper.value);
    parentNode.value.removeEventListener("scroll", scrollEvent);
  }
});

//随机数生成
function generateUniqueRandomPositiveInteger() {
  const timestamp = new Date().getTime();
  const randomNumber = Math.floor(Math.random() * 1000); // 生成一个随机数，可以根据需求调整范围
  const uniqueRandomNumber = parseInt(
    timestamp.toString() + randomNumber.toString()
  );
  return uniqueRandomNumber;
}

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
// 数据变得时候滚动回去
watch(
  () => props.dataSource,
  (val) => {
    if (val) {
      if (
        attrs &&
        Object.prototype.hasOwnProperty.call(attrs, "scroll") &&
        Object.prototype.hasOwnProperty.call(attrs.scroll, "y")
      ) {
        scrollY.value = scrollY2Number((attrs.scroll as ScrollType).y);
      }
      placeholderWrapper.value.style.height =
        yItemHeight.value * props.dataSource.length - scrollY.value + "px";
      screenHeight.value = parentNode.value.clientHeight;
      const startIdx = 0;
      const endIdx = startIdx + visibleCount.value;
      range.value = [startIdx, endIdx];
      //重置滚动条
      parentNode.value.scrollTop = 0;
      contentNode.value.style.transform = `translate3d(0, ${0}px, 0)`;
    }
  }
);
</script>

<style scoped>
.y-virtualized {
  position: relative;
  height: auto;
}
</style>