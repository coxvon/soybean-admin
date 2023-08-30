<template>
  <n-modal v-model:show="modalVisible" preset="card" title="用户绑定" class="w-1/2">
    <n-transfer
      ref="transfer"
      v-model:value="value"
      virtual-scroll
      :options="options"
      source-filterable
      target-filterable
      :render-source-label="handleRenderLabel"
      :show-selected="false"
      :render-target-label="handleRenderLabel"
      :filter="handleFilter"
    />
    <n-space class="w-full pt-16px" :size="24" justify="end">
      <n-button @click="close">取消</n-button>
      <n-button type="primary" :loading="loading" @click="handleSubmit">确定</n-button>
    </n-space>
  </n-modal>
</template>
<script setup lang="tsx">
import { ref, unref, computed, watch, toRaw } from 'vue';
import type { TransferOption } from 'naive-ui';
import { NButton, NModal, NSpace, NTransfer } from 'naive-ui';
import { zip, catchError, map } from 'rxjs';
import { listUser, addUserMapping, listUserMapping } from '@/service';
import { useLoading } from '@/hooks';

defineOptions({ name: 'RoleUserModal' });

const props = withDefaults(defineProps<{ visible: boolean; roleId: string }>(), {
  visible: false,
  roleId: ''
});

interface Emits {
  (e: 'update:visible', visible: boolean): void;
}
const emit = defineEmits<Emits>();

const modalVisible = computed<boolean>({
  get() {
    return props.visible;
  },
  set(visible: boolean) {
    emit('update:visible', visible);
  }
});

const value = ref<string[]>([]);
const options = ref<TransferOption[]>();
const { loading, startLoading, endLoading } = useLoading();

const close = () => {
  modalVisible.value = false;
  value.value = [];
  options.value = [];
};

const handleSubmit = () => {
  startLoading();
  addUserMapping(props.roleId, toRaw(unref(value)))
    .then(({ error, data }) => {
      if (!error) {
        value.value = [];
        close();
        window.$message?.info(data);
      }
    })
    .finally(() => endLoading());
};
const handleRenderLabel = ({ option }: any) => {
  return <span>{`${option.label}::${option.name}`}</span>;
};

const handleFilter = (pattern: string, option: TransferOption) => {
  if (!pattern) {
    return true;
  }
  const roleUser = option as any;
  const label = (roleUser.groupName ? `${roleUser.groupName}-` : '') + roleUser.name;
  return label.includes(pattern);
};

const loadData = () => {
  startLoading();
  zip(listUser(null), listUserMapping(props.roleId))
    .pipe(
      map(
        ([{ data }, { data: users }]: [
          Service.RequestResult<UserManagement.User[] | null>,
          Service.RequestResult<any[]>
        ]) => {
          if (data) {
            options.value = data.map(d => ({ value: d.id, label: d.username, name: d.name })) as TransferOption[];
          }
          if (users) {
            value.value = users.map(d => d.userId);
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
  () => props.visible,
  newValue => {
    if (newValue) {
      loadData();
    }
  }
);
</script>
