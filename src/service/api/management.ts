import { adapter } from '@/utils';
import { mockRequest, requestX } from '../request';
import { adapterOfFetchUserList } from './management.adapter';

/** 获取用户列表 */
export const fetchUserList = async () => {
  const data = await mockRequest.post<ApiUserManagement.User[] | null>('/getAllUserList');
  return adapter(adapterOfFetchUserList, data);
};

export const addUser = async (params: ApiUserManagement.User) => {
  return requestX.post<string>('user/add', { ...params });
};

export const updateUser = async (params: ApiUserManagement.User) => {
  return requestX.post<string>('user/update', { ...params });
};

export const removeUser = async (idArr: string[]) => {
  return requestX.post<string>('user/remove', { ids: idArr });
};

export const pageUser = async (params: any) => {
  return requestX.get<ApiUserManagement.User[] | null>('user/page', { params });
};
