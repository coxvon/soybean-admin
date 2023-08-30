<template>
  <div>
    <n-card title="角色管理" :bordered="false" class="rounded-16px shadow-sm">
      <n-space class="pb-12px" justify="space-between">
        <n-space>
          <n-button type="primary" @click="showAddRole">
            <icon-ic-round-plus class="mr-4px text-20px" />
            新增
          </n-button>
        </n-space>
      </n-space>

      <n-data-table
        ref="tableRef"
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        :row-key="rowData => rowData.id"
      />
    </n-card>
    <!-- 编辑 -->
    <n-modal v-model:show="visible" :title="isAdd ? '角色添加' : '角色修改'" preset="card" class="w-700px">
      <n-form ref="formRef" label-placement="left" :label-width="80" :model="roleData" :rules="rules">
        <n-grid :x-gap="18" :cols="2">
          <n-form-item-grid-item label="角色编码" path="code">
            <n-input v-model:value="roleData.code"></n-input>
          </n-form-item-grid-item>
          <n-form-item-grid-item label="角色名称" path="name">
            <n-input v-model:value="roleData.name"></n-input>
          </n-form-item-grid-item>
          <n-form-item-grid-item label="状态" path="status">
            <n-radio-group v-model:value="roleData.status" name="radiogroup">
              <n-space>
                <n-radio v-for="so in statusOptions" :key="so.value" :value="so.value">
                  {{ so.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </n-form-item-grid-item>
          <n-form-item-grid-item :span="24" label="描述" path="description">
            <n-input v-model:value="roleData.description" type="textarea"></n-input>
          </n-form-item-grid-item>
        </n-grid>
        <n-space class="w-full pt-16px" :size="24" justify="end">
          <n-button @click="close">取消</n-button>
          <n-button type="primary" @click="saveRole">确定</n-button>
        </n-space>
      </n-form>
    </n-modal>
    <role-user-modal v-model:visible="userVisible" :role-id="currentId"></role-user-modal>
    <role-menu-drawer v-model:active="menuActive" :role-id="currentId"></role-menu-drawer>
  </div>
</template>

<script setup lang="tsx">
import { ref, unref, reactive, onMounted, toRaw } from 'vue';
import type { DataTableColumns, FormRules } from 'naive-ui';
import { NButton, NSpace, NTag } from 'naive-ui';
import { pageRole, addRole, updateRole, removeRole } from '@/service';
import { useBoolean } from '@/hooks';
import { createRequiredFormRule } from '@/utils';
import useTable from '@/hooks/business/use-custom-table';
import TipIcon from '~/src/components/custom/tip-icon.vue';
import RoleUserModal from './components/role-user-modal.vue';
import RoleMenuDrawer from './components/role-menu-drawer.vue';

const { data, pagination, loading, getTableData } = useTable<SystemManagement.Role<Enum>>(pageRole);
const statusOptions: { value: number; label: string }[] = [
  {
    value: 1,
    label: '启用'
  },
  {
    value: 0,
    label: '禁用'
  }
];
const tableRef = ref();
const formRef = ref();
const { bool: visible, setTrue: show, setFalse: close } = useBoolean(false);
const { bool: userVisible, setTrue: showUser } = useBoolean(false);
const { bool: menuActive, setTrue: showMenu } = useBoolean(false);
const isAdd = ref<boolean>(true);
const rules: FormRules = {
  code: createRequiredFormRule('请输入角色编码'),
  name: createRequiredFormRule('请输入角色名称')
};
const defaultRole: SystemManagement.Role<number> = {
  id: '',
  code: '',
  name: '',
  description: '',
  status: 1
};
const tagTypes: Record<string, NaiveUI.ThemeColor> = {
  1: 'success',
  0: 'error'
};
const roleData = reactive<SystemManagement.Role<number>>({ ...defaultRole });

const currentId = ref<string>();

const columns: DataTableColumns<SystemManagement.Role<Enum>> = [
  {
    type: 'selection',
    align: 'center'
  },
  {
    key: 'index',
    title: '序号',
    align: 'center',
    render: (_, idx) => <span> {idx + 1} </span>
  },
  {
    key: 'code',
    title: '角色编码',
    align: 'center'
  },
  {
    key: 'name',
    title: '角色名称',
    align: 'center'
  },
  {
    key: 'description',
    title: '描述',
    align: 'center'
  },
  {
    key: 'status',
    title: '状态',
    align: 'center',
    render: row => {
      if (row.status) {
        return <NTag type={tagTypes[row.status.code]}>{row.status.value}</NTag>;
      }
      return '';
    }
  },
  {
    key: 'actions',
    title: '操作',
    align: 'center',
    render: row => (
      <NSpace justify={'center'}>
        <TipIcon
          icon="mdi:note-edit"
          onClick={() => {
            isAdd.value = false;
            Object.assign(roleData, { ...row, status: row.status ? row.status.code : 1 });
            show();
          }}
        >
          编辑
        </TipIcon>
        <TipIcon
          icon="mdi:account-wrench"
          onClick={() => {
            currentId.value = row.id;
            showUser();
          }}
        >
          人员绑定
        </TipIcon>
        <TipIcon
          icon="mdi:file-tree"
          onClick={() => {
            currentId.value = row.id;
            showMenu();
          }}
        >
          菜单绑定
        </TipIcon>
        <TipIcon
          icon="mdi:delete-alert"
          confirm="确定删除么"
          onClick={() => {
            removeRole(row.id).then(res => {
              window.$message?.info(res.data as string);
              getTableData();
            });
          }}
        >
          删除
        </TipIcon>
      </NSpace>
    )
  }
];

const showAddRole = () => {
  isAdd.value = true;
  Object.assign(roleData, { ...defaultRole });
  show();
};

const saveRole = () => {
  unref(formRef)
    .validate()
    .then((err: any) => {
      if (err) return;
      if (isAdd.value) {
        addRole(toRaw(roleData)).then(({ error }) => {
          if (!error) {
            close();
            getTableData();
          }
        });
      } else {
        updateRole(toRaw(roleData)).then(({ error }) => {
          if (!error) {
            close();
            getTableData();
          }
        });
      }
    });
};

onMounted(() => {
  getTableData();
});
</script>

<style scoped></style>
