<template>
  <n-drawer v-model:show="drawerActive" :width="600">
    <n-drawer-content>
      <template #header>菜单绑定</template>
      <template #footer>
        <n-space class="w-full pt-16px" :size="24" justify="end">
          <n-button @click="close">取消</n-button>
          <n-button type="primary" :loading="loading" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
      <div class="h-10">
        <n-input v-model:value="pattern" placeholder="搜索" />
      </div>
      <n-card :borderd="true" class="h-[calc(100%-2.5rem)] overflow-y-scroll">
        <n-spin size="medium" :show="loading">
          <n-tree
            ref="treeRef"
            block-line
            :pattern="pattern"
            key-field="id"
            :checked-keys="value"
            :data="options"
            checkable
            expand-on-click
            selectable
            cascade
            virtual-scroll
            default-expand-all
            :render-label="handleRenderLabel"
            :filter="handleFilter"
            @update:checked-keys="handleUpdateCheckedKeys"
            @update:indeterminate-keys="handleIndeterminate"
          />
        </n-spin>
      </n-card>
    </n-drawer-content>
  </n-drawer>
</template>
<script setup lang="tsx">
import { ref, computed, watch } from 'vue';
import type { TreeOption } from 'naive-ui';
import { NTree, NButton, NSpace } from 'naive-ui';
import { zip, catchError, map } from 'rxjs';
import { listMenu, addMenuMapping, listMenuMapping } from '@/service';
import { useLoading } from '@/hooks';
defineOptions({ name: 'RoleUserModal' });
const props = withDefaults(defineProps<{ active: boolean; roleId: string }>(), {
  active: false,
  roleId: ''
});
interface Emits {
  (e: 'update:active', active: boolean): void;
}
const emit = defineEmits<Emits>();
const drawerActive = computed<boolean>({
  get() {
    return props.active;
  },
  set(active: boolean) {
    emit('update:active', active);
  }
});
const value = ref<string[]>([]);
const mark = ref<string[]>([]);
const treeRef = ref();
const options = ref<TreeOption[]>();
const { loading, startLoading, endLoading } = useLoading();
const pattern = ref<string>();

const close = () => {
  drawerActive.value = false;
  value.value = [];
  mark.value = [];
  options.value = [];
  pattern.value = '';
};
const handleSubmit = () => {
  startLoading();
  const checkedData = treeRef.value.getCheckedData();
  const indeterminateData = treeRef.value.getIndeterminateData();
  const checkedArr: string[] = [];
  const indeterminateArr: string[] = [];
  // 过滤无效节点
  for (const idx in checkedData.keys) {
    if (checkedData.options[idx]) {
      checkedArr.push(checkedData.keys[idx]);
    }
  }
  for (const idx in indeterminateData.keys) {
    if (indeterminateData.options[idx]) {
      indeterminateArr.push(indeterminateData.keys[idx]);
    }
  }
  addMenuMapping(props.roleId, checkedArr, indeterminateArr)
    .then(({ error }) => {
      if (!error) {
        value.value = [];
        close();
      }
    })
    .finally(() => endLoading());
};

const handleRenderLabel = ({ option }: any) => {
  return `${option.title} :: ${option.name}`;
};

const handleUpdateCheckedKeys = (keys: string[]) => {
  value.value = keys;
};
const handleIndeterminate = (keys: string[]) => {
  mark.value = keys;
};

const handleFilter = (str: string, option: TreeOption) => {
  if (!str) {
    return true;
  }
  const roleMenu = option as any;
  const label = (roleMenu.title ? `${roleMenu.title} :: ` : '') + roleMenu.name;
  return label.includes(str);
};

const loadData = () => {
  startLoading();
  zip(listMenu(), listMenuMapping(props.roleId))
    .pipe(
      map(
        ([{ data }, { data: roleMenus }]: [
          Service.RequestResult<SystemManagement.Menu[]>,
          Service.RequestResult<any[]>
        ]) => {
          if (data) {
            options.value = data as unknown as TreeOption[];
          }
          if (roleMenus) {
            value.value = roleMenus.map(m => m.menuId);
          }
        }
      ),
      catchError(() => {
        return [];
      })
    )
    .subscribe(() => {
      endLoading();
    });
};
watch(
  () => props.active,
  newValue => {
    if (newValue) {
      loadData();
    }
  }
);
</script>
