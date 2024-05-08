<template>
  <div>
    <a-checkbox
      v-model:checked="checkAll"
      :indeterminate="indeterminate"
      @change="onCheckAllChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from "vue";
import { Checkbox as ACheckbox } from "ant-design-vue";

const props = defineProps({
  dataSourceLength: {
    type: Number as PropType<number>,
    default: 0,
  },
  selectLength: {
    type: Number as PropType<number>,
    default: 0,
  },
});
const emits = defineEmits(["checkAllChange"]);
const checkAll = ref(false);
const indeterminate = ref(false);

//这个方法估计触发不到
const onCheckAllChange = () => {
  indeterminate.value = false;
  emits("checkAllChange", checkAll.value);
};
watch(
  () => props.selectLength,
  (val) => {
    if (val > 0) {
      if (val !== props.dataSourceLength) {
        indeterminate.value = true;
        checkAll.value = false;
      } else {
        checkAll.value = true;
        indeterminate.value = false;
      }
    } else {
      indeterminate.value = false;
      checkAll.value = false;
    }
  },
  {
    deep: true,
    immediate: true,
  }
);
</script>
