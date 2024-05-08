<template>
  <div :class="[virtualized && `box-${virtualizedClass}`]">
    <v-table
      v-bind="$attrs"
      :data-source="renderList"
      :size="size"
      :class="[virtualized && virtualizedClass]"
      :row-selection="setRowSelection()"
    >
      <!-- 通过循环去创建，像emptyText这些，obj值为空的，v-bind="obj"会报错，需要过滤 -->
      <template v-for="(__item, key) in $slots" :key="key" #[key]="obj">
        <slot
          v-if="['emptyText', 'summary'].includes(key as string)"
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
import {
  TableRowSelection,
  SelectionSelectFn,
} from "ant-design-vue/es/table/interface";
import { SizeType } from "ant-design-vue/lib/config-provider";
import { Key } from "ant-design-vue/lib/table/interface";
import {
  onMounted,
  onUnmounted,
  ref,
  computed,
  PropType,
  watch,
  Ref,
  useAttrs,
  h,
  render,
} from "vue";
import vCheckBox from "./components/check-box.vue";

const props = defineProps({
  dataSource: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: Array as PropType<any[]>,
    default: () => [],
  },
  virtualized: {
    type: Boolean,
    default: true,
  },
  itemHeight: {
    type: Number,
    default: 0,
  },
  size: {
    type: String as PropType<SizeType>,
    default: "default",
  },
  rowSelection: {
    type: Object as PropType<TableRowSelection>,
    default: () => {},
  },
});

const attrs = useAttrs();

//勾选时用的
const selectedRowKeysTem: Ref<Key[]> = ref([]);

//勾选的数组
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedRowsTem: Ref<any> = ref([]);

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

const observer = ref();

const selectionColumn = ref();
const antSelection = ref();

//勾选配置项
const setRowSelection = () => {
  if (props.virtualized) {
    if (props.rowSelection) {
      return {
        ...props.rowSelection,
        onChange: onSelectChange,
        onSelectAll: onSelectAllAction,
        onSelect: onSelectAction,
      };
    }
    return undefined;
  }
  return props.rowSelection || undefined;
};

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

//勾选事项
const onSelectChange = <T extends SelectionSelectFn<T>>(
  selectedRowKeys: Key[],
  selectedRows: T[]
) => {
  if (props.rowSelection.type === "radio") {
    selectedRowKeysTem.value = selectedRowKeys;
    selectedRowsTem.value = selectedRows;
  } else {
    const keyArr = [
      ...new Set([...selectedRowKeysTem.value, ...selectedRowKeys]),
    ];
    selectedRowKeysTem.value = keyArr;
    const rowArr = [...selectedRowsTem.value, ...selectedRows];
    selectedRowsTem.value = Array.from(
      rowArr
        .reduce((map, obj) => map.set(JSON.stringify(obj), obj), new Map())
        .values()
    );
  }
  return (props.rowSelection.onChange as Function)(
    selectedRowKeysTem.value,
    selectedRowsTem.value
  );
};

//选择或者取消勾选
const onSelectAction = <T extends SelectionSelectFn<T>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: any,
  selected: boolean,
  selectedRows: T[],
  nativeEvent: Event
) => {
  if (!selected) {
    if (selectedRowKeysTem.value.includes(record[attrs["row-key"] as string])) {
      selectedRowKeysTem.value = selectedRowKeysTem.value.filter(
        (item) => item !== record[attrs["row-key"] as string]
      );
      selectedRowsTem.value = selectedRowsTem.value.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) =>
          item[attrs["row-key"] as string] !==
          record[attrs["row-key"] as string]
      );
    }
  }
  if (typeof props.rowSelection.onSelect === "function") {
    return (props.rowSelection.onSelect as Function)(
      record,
      selected,
      selectedRows,
      nativeEvent
    );
  }
};

const onSelectAllAction = <T extends SelectionSelectFn<T>>(
  selected: boolean,
  selectedRows?: T[],
  changeRows?: T[]
) => {
  if (selected) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedRowKeysTem.value = props.dataSource.map((item: any) => {
      return item[attrs["row-key"] as string];
    });
    selectedRowsTem.value = props.dataSource;
  } else {
    if (selectedRowKeysTem.value.length != props.dataSource.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedRowKeysTem.value = props.dataSource.map((item: any) => {
        return item[attrs["row-key"] as string];
      });
      selectedRowsTem.value = props.dataSource;
    } else {
      selectedRowKeysTem.value = [];
      selectedRowKeysTem.value = [];
    }
  }
  if (typeof props.rowSelection.onSelectAll === "function") {
    return (props.rowSelection.onSelectAll as Function)(
      selected,
      selectedRows,
      changeRows
    );
  }
};

//滚动触发时切割数据
const scrollEvent = () => {
  // 性能优化一下
  window.requestAnimationFrame(() => {
    screenHeight.value = parentNode.value.clientHeight;
    const startIdx = Math.floor(parentNode.value.scrollTop / yItemHeight.value);
    const endIdx = startIdx + visibleCount.value;
    range.value = [startIdx, endIdx];
    const offset =
      parentNode.value.scrollTop -
      (parentNode.value.scrollTop % yItemHeight.value);
    contentNode.value.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
};

const initVir = () => {
  if (props.virtualized) {
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
        yItemHeight.value * props.dataSource.length - scrollY.value + "px";
      parentNode.value.appendChild(placeholderWrapper.value);
      screenHeight.value = parentNode.value.clientHeight;
      parentNode.value.addEventListener("scroll", scrollEvent);
      observerAction();
    }
  }
};
const observerAction = () => {
  observer.value = new MutationObserver(() => {
    if (currentHeight.value !== parentNode.value.clientHeight) {
      window.requestAnimationFrame(() => {
        scrollY.value = parentNode.value.clientHeight;
        let placeholderHeight =
          yItemHeight.value * props.dataSource.length - scrollY.value;
        if (placeholderHeight < 0) {
          placeholderHeight = 0;
        }
        placeholderWrapper.value.style.height = placeholderHeight + "px";
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
      });
    }
  });
  observer.value.observe(parentNode.value, {
    attributes: true,
    childList: false,
    subtree: false,
  });
};

//自定义的勾选按钮逻辑
const initSelectionColumn = () => {
  if (props.virtualized) {
    if (!selectionColumn.value) {
      selectionColumn.value = document.querySelector(
        `.${virtualizedClass.value} .ant-table-thead .ant-table-selection-column`
      );
      antSelection.value = document.querySelector(
        `.${virtualizedClass.value} .ant-table-thead .ant-table-selection-column .ant-table-selection`
      );
    }
    if (selectionColumn.value && antSelection.value) {
      antSelection.value.classList.add("custom-selection");
      render(
        h(vCheckBox, {
          dataSourceLength: props.dataSource.length | 0,
          selectLength: selectedRowKeysTem.value.length | 0,
          ["onCheckAllChange"]: checkAllChange,
        }),
        selectionColumn.value
      );
    }
  }
};
//自定义全选触发
const checkAllChange = (selected: boolean) => {
  // onSelectAllAction(selected)
  if (selected) {
    selectedRowKeysTem.value = props.dataSource.map((item) => {
      return item[attrs["row-key"] as string];
    });
  } else {
    selectedRowKeysTem.value = [];
  }
};

onMounted(() => {
  initVir();
  initSelectionColumn();
});

onUnmounted(() => {
  if (props.virtualized && parentNode.value) {
    parentNode.value.removeChild(placeholderWrapper.value);
    parentNode.value.removeEventListener("scroll", scrollEvent);
    observer.value.disconnect(); //停止监听
    selectionColumn.value = null;
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

//数组对比
function findChanges(oldArray: Key[], newArray: Key[]) {
  // const added = newArray.filter((item) => !oldArray.includes(item))
  const removed = oldArray.filter((item) => !newArray.includes(item));
  return { removed };
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
  () => [props.dataSource, props.dataSource.length],
  (val, length) => {
    if (
      val &&
      props.virtualized &&
      length &&
      parentNode.value &&
      contentNode.value
    ) {
      scrollY.value = parentNode.value.clientHeight;
      let placeholderHeight =
        yItemHeight.value * props.dataSource.length - scrollY.value;
      if (placeholderHeight < 0) {
        placeholderHeight = 0;
      }
      placeholderWrapper.value.style.height = placeholderHeight + "px";
      screenHeight.value = parentNode.value.clientHeight;
      const startIdx = 0;
      const endIdx = startIdx + visibleCount.value;
      range.value = [startIdx, endIdx];
      //重置滚动条
      parentNode.value.scrollTop = 0;
      contentNode.value.style.transform = `translate3d(0, ${0}px, 0)`;
      selectedRowKeysTem.value = [];
      selectedRowsTem.value = [];
      initSelectionColumn();
    }
  }
);

watch(
  () => props.rowSelection,
  (newVal, OldVal) => {
    if (newVal.selectedRowKeys?.length !== OldVal.selectedRowKeys?.length) {
      if (props.rowSelection.type === "radio") {
        selectedRowKeysTem.value = newVal.selectedRowKeys as Key[];
      } else {
        //对比数组找出新增与删除的
        const { removed } = findChanges(
          OldVal.selectedRowKeys as Key[],
          newVal.selectedRowKeys as Key[]
        );
        const keyArr = [
          ...selectedRowKeysTem.value,
          ...(newVal.selectedRowKeys as Key[]),
        ];
        if (removed.length > 0)
          selectedRowKeysTem.value = keyArr.filter(
            (item) => removed.indexOf(item) === -1
          );
      }
      initSelectionColumn();
    }
  }
);
</script>

<style scoped>
.y-virtualized {
  position: relative;
  height: auto;
}
:deep(.custom-selection) {
  position: absolute !important;
  left: calc(50% - 8px);
  z-index: 1000;
  opacity: 0;
}
</style>
