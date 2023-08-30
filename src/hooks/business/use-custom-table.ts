import type { Ref } from 'vue';
import { reactive, ref } from 'vue';
import type { PaginationInfo, PaginationProps } from 'naive-ui';
import { useLoading } from '../common';
type ApiFn<T = any, R = any> = (args: T) => Promise<Service.RequestResult<R>>;
export default <T>(
  request: ApiFn,
  transform?: (record: any) => T,
  pageConfig: PaginationProps = {}
): {
  data: Ref<T[] | undefined>;
  pagination: any;
  setData: (fullData: any) => void;
  loading: Ref<boolean>;
  startLoading: () => void;
  endLoading: () => void;
  getTableData: (args?: any) => void;
} => {
  const params = ref<any>({});
  const { loading, startLoading, endLoading } = useLoading(false);

  const pagination: PaginationProps = reactive({
    page: 1,
    pageSize: 50,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    showQuickJumper: true,
    prefix: (info: PaginationInfo) => `共 ${info.itemCount} 条记录`,
    onChange: (page: number) => {
      pagination.page = page;
      getTableData();
    },
    onUpdatePageSize: (pageSize: number) => {
      pagination.pageSize = pageSize;
      pagination.page = 1;
      getTableData();
    },
    ...pageConfig
  }) as PaginationProps;
  const data = ref<T[]>();

  const setData = (fullData: any) => {
    if (fullData?.records) {
      if (transform) {
        data.value = fullData?.records.map(transform);
      } else {
        data.value = fullData?.records;
      }
    }
    pagination.pageCount = Number(fullData?.pageCount);
    pagination.itemCount = Number(fullData?.itemCount);
  };
  async function getTableData(args?: any) {
    startLoading();
    if (!(args instanceof MouseEvent)) {
      params.value = { ...params.value, ...args };
    }

    request({ pageNumber: pagination.page, pageSize: pagination.pageSize, ...params.value }).then(
      ({ data: result }) => {
        setData(result);
        endLoading();
      }
    );
  }
  return {
    data,
    pagination,
    setData,
    loading,
    startLoading,
    endLoading,
    getTableData
  } as const;
};
