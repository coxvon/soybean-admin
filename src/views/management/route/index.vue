<template>
  <n-spin :show="loading">
    <n-grid :x-gap="12">
      <n-gi :span="6">
        <n-card title="菜单管理" :bordered="false" class="rounded-16px shadow-sm">
          <n-scrollbar trigger="none" style="max-height: calc(100vh - 268px)">
            <n-tree
              block-line
              :data="treeData"
              :default-expanded-keys="defaultExpandedKeys"
              key-field="id"
              label-field="title"
              selectable
              default-expand-all
              :selected-keys="selectedKeys"
              :render-prefix="renderTreePrefix"
              @update:selected-keys="handleSelectedKeys"
            />
          </n-scrollbar>
        </n-card>
      </n-gi>
      <n-gi :span="18">
        <n-card title="菜单详情" :bordered="false" class="rounded-16px shadow-sm">
          <template #header-extra>
            <icon-material-symbols:note-add v-if="isAdd" />
            <icon-material-symbols:edit-document v-else />
          </template>
          <n-form ref="formRef" label-placement="left" :label-width="90" :model="formModel" :rules="rules">
            <n-grid :cols="24" :x-gap="18">
              <n-form-item-grid-item :span="12" label="菜单名称" path="title">
                <n-input v-model:value="formModel.title" />
              </n-form-item-grid-item>
              <n-form-item-grid-item :span="12" label="菜单路径" path="path">
                <n-input v-model:value="formModel.path" placeholder="与前端路径保持一致，/开头，/作为分割符" />
              </n-form-item-grid-item>
              <n-form-item-grid-item :span="12" label="菜单图标" path="icon">
                <n-input v-model:value="formModel.icon">
                  <template #suffix>
                    <svg-icon :icon="formModel.icon" />
                  </template>
                </n-input>
              </n-form-item-grid-item>

              <n-form-item-grid-item :span="12" label="所属菜单" path="parentId">
                <n-tree-select
                  v-model:value="formModel.parentId"
                  :options="selectData"
                  key-field="id"
                  label-field="title"
                  disabled-field="isLeaf"
                />
              </n-form-item-grid-item>
              <n-form-item-grid-item :span="12" label="菜单类型" path="isLeaf">
                <n-switch v-model:value="formModel.isLeaf" :round="false">
                  <template #checked>菜单</template>
                  <template #unchecked>分组</template>
                </n-switch>
              </n-form-item-grid-item>
              <n-form-item-grid-item :span="12" label="菜单顺序" path="orderNo">
                <n-input-number v-model:value="formModel.orderNo" />
              </n-form-item-grid-item>
              <n-form-item-grid-item :span="12" label="是否缓存" path="keepAlive">
                <n-switch v-model:value="formModel.keepAlive" />
              </n-form-item-grid-item>
              <n-form-item-grid-item :span="12" label="父容器类型" path="singleLayout">
                <n-select v-model:value="formModel.singleLayout" :options="layoutOptions" clearable />
              </n-form-item-grid-item>
              <n-form-item-grid-item :span="12" label="外链" path="href">
                <n-input v-model:value="formModel.href" />
              </n-form-item-grid-item>
            </n-grid>
            <div>
              <n-space>
                <n-button type="primary" @click="handleSave">保存</n-button>
                <n-button :disabled="isAdd" @click="add">新增</n-button>
                <n-popconfirm @positive-click="handleDelete">
                  <template #trigger>
                    <n-button type="error" :disabled="isAdd || (formModel.children && formModel.children.length > 0)">
                      删除
                    </n-button>
                  </template>
                  确定要删除此菜单么？
                </n-popconfirm>
                <web-site-link label="iconify地址：" link="https://icones.js.org/" class="mt-10px" />
              </n-space>
            </div>
          </n-form>
        </n-card>
      </n-gi>
    </n-grid>
  </n-spin>
</template>

<script setup lang="tsx">
import { ref, reactive, onMounted, toRaw } from 'vue';
import type { TreeOption, TreeSelectOption, FormItemRule } from 'naive-ui';
import { listMenu, addMenu, updateMenu, removeMenu } from '@/service';
import { createRequiredFormRule } from '@/utils';

const treeData = ref<TreeOption[]>([]);
const selectData = ref<TreeSelectOption[]>([]);
const defaultExpandedKeys = ref();
const selectedKeys = ref<string[]>([]);
const isAdd = ref<boolean>(true);
const loading = ref<boolean>(false);
const formRef = ref();
const defaultValue: SystemManagement.Menu = {
  id: '',
  name: '',
  path: '',
  component: '',
  parentId: '0',
  title: '',
  orderNo: 0,
  icon: 'mdi:all-inclusive',
  isLeaf: false,
  singleLayout: '',
  requiresAuth: true,
  keepAlive: false
};
const layoutOptions: { value: string; label: string }[] = [
  {
    value: 'blank',
    label: '空白'
  },
  {
    value: 'basic',
    label: '基础'
  }
];
const formModel = reactive<SystemManagement.Menu>({ ...defaultValue });
const rules: Record<string, FormItemRule | FormItemRule[]> = {
  title: createRequiredFormRule('请输入菜单名称'),
  name: createRequiredFormRule('请输入菜单编码'),
  path: createRequiredFormRule('请输入菜单路径'),
  parentId: createRequiredFormRule('请选择父菜单'),
  type: createRequiredFormRule('请选择菜单类型')
};

const init = async () => {
  loading.value = true;
  const { data } = await listMenu();

  const selectOptions: TreeSelectOption[] = [];
  selectedKeys.value = [];
  if (data && data.length > 0) {
    const options: TreeOption[] = [];
    const selects: TreeOption[] = [];
    data.forEach((menu: SystemManagement.Menu) => {
      options.push({
        ...menu
      });
      selects.push({
        ...menu
      });
    });
    treeData.value = options;
    selectOptions.push({
      id: '0',
      title: '根菜单',
      children: selects
    });
  }

  selectData.value = selectOptions;
  loading.value = false;
};

const resolveComponent = (values: any) => {
  if (values.isLeaf) {
    values.component = 'self';
  } else if (values.parentId !== '0') {
    values.component = 'multi';
  } else {
    values.component = 'basic';
  }
};

const handleSelectedKeys = (_keys: string[], options: Array<TreeOption | null>) => {
  formRef.value.restoreValidation();
  if (options && options.length > 0) {
    Object.assign(formModel, options[0]);
    isAdd.value = false;
  } else {
    Object.assign(formModel, { ...defaultValue });
    isAdd.value = true;
  }
  Object.assign(formModel, { creator: undefined, modifier: undefined });
};
const renderTreePrefix = ({ option }: { option: TreeOption; checked: boolean; selected: boolean }) => {
  if (option.icon) {
    return <svg-icon icon={option.icon} />;
  }
  return '';
};

const add = () => {
  Object.assign(formModel, {
    ...defaultValue,
    parentId: !formModel.isLeaf && formModel.id ? formModel.id : formModel.parentId,
    creator: undefined,
    modifier: undefined
  });
  isAdd.value = true;
};

const handleSave = async () => {
  const error = await formRef.value?.validate();
  if (error) {
    return;
  }
  loading.value = true;
  const values = toRaw(formModel);
  delete values.children;
  if (!values.path.startsWith('/')) {
    values.path = `/${values.path}`;
  }
  Object.assign(values, {
    name: values.path
      .split('/')
      .filter(p => Boolean(p))
      .join('_')
  });
  resolveComponent(values);
  let result;
  if (isAdd.value) {
    result = await addMenu(values);
  } else {
    result = await updateMenu(values);
  }
  if (result.data) {
    init();
  }
  add();
  loading.value = false;
};
const handleDelete = async () => {
  if (!formModel.id) {
    window.$message?.warning('请选择要删除的菜单！');
    return;
  }
  const { data } = await removeMenu(formModel.id);
  if (data) {
    init();
  }
};

onMounted(async () => {
  init();
});
</script>
