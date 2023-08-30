import { adapter } from '@/utils';
import { mockRequest, requestX } from '../request';
import { adapterOfFetchUserList } from './management.adapter';

/** 获取用户列表 */
export const fetchUserList = async () => {
  const data = await mockRequest.post<ApiUserManagement.User[] | null>('/getAllUserList');
  return adapter(adapterOfFetchUserList, data);
};

export const addUser = async (data: ApiUserManagement.User) => {
  return requestX.post<string>('user/add', { ...data });
};

export const updateUser = async (data: ApiUserManagement.User) => {
  return requestX.post<string>('user/update', { ...data });
};

export const removeUser = async (idArr: string[]) => {
  return requestX.post<string>('user/remove', { ids: idArr });
};

export const pageUser = async (params: any) => {
  return requestX.get<UserManagement.User[] | null>('user/page', { params });
};
export const listUser = async (params: any) => {
  return requestX.get<UserManagement.User[] | null>('user/list', { params });
};
/** 菜单相关 */

export const listMenu = async () => {
  return requestX.get<SystemManagement.Menu[]>('menu/list');
};

export const addMenu = async (data: SystemManagement.Menu) => {
  return requestX.post<string>('menu/add', data);
};

export const updateMenu = async (data: SystemManagement.Menu) => {
  return requestX.post<string>('menu/update', data);
};

export const removeMenu = async (id: string) => {
  return requestX.post<string>('menu/remove', { id });
};
// 角色相关
export const pageRole = async (params: any) => {
  return requestX.get<SystemManagement.Role<Enum>>('role/page', { params });
};

export const addRole = async (data: SystemManagement.Role<number>) => {
  return requestX.post<string>('role/add', data);
};

export const updateRole = async (data: SystemManagement.Role<number>) => {
  return requestX.post<string>('role/update', data);
};

export const removeRole = async (id: string) => {
  return requestX.post<string>('role/remove', { id });
};

export const listUserMapping = async (roleId: string) => {
  return requestX.get<any[]>('role/listUserMapping', { params: { roleId } });
};

export const listMenuMapping = async (roleId: string) => {
  return requestX.get<any[]>('role/listMenuMapping', { params: { roleId } });
};

export const addUserMapping = async (roleId: string, userIds: string[]) => {
  return requestX.post<string>('role/addUserMappings', { roleId, userIds });
};

export const addMenuMapping = async (roleId: string, menuIds: string[], markIds: string[]) => {
  return requestX.post<string>('role/addMenuMappings', { roleId, menuIds, markIds });
};
