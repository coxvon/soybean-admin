/** 用户相关模块 */
declare namespace Auth {
  /**
   * 用户角色类型(前端静态路由用角色类型进行路由权限的控制)
   * - super: 超级管理员(该权限具有所有路由数据)
   * - admin: 管理员
   * - user: 用户
   */
  type RoleType = 'super' | 'admin' | 'user';

  /** 用户信息 */
  interface UserInfo {
    /** 用户id */
    userId: string;
    /** 用户名 */
    userName: string;
    /** 用户角色类型 */
    userRole: RoleType;
  }
}
interface Enum {
  code: string;
  value: string;
}

declare namespace SystemManagement {
  interface Menu {
    id: string;
    name: string;
    path: string;
    title: string;
    orderNo: number;
    parentId: string;
    component: string;
    icon: string;
    isLeaf: boolean;
    children?: any[];
    keepAlive: boolean;
    singleLayout: string;
    requiresAuth: boolean;
    href?: string;
    localIcon?: string;
    i18nTitle?: string;
  }
  interface Role<T> {
    id: string;
    name: string;
    code: string;
    status: T;
    description: string;
  }
}

declare namespace UserManagement {
  interface User extends ApiUserManagement.User {
    /** 序号 */
    index: number;
    name?: string;
    username?: string;
    /** 表格的key（id） */
    key: string;
  }

  /**
   * 用户性别
   * - 0: 女
   * - 1: 男
   */
  type GenderKey = NonNullable<User['gender']>;

  /**
   * 用户状态
   * - 1: 启用
   * - 2: 禁用
   * - 3: 冻结
   * - 4: 软删除
   */
  type UserStatusKey = NonNullable<User['userStatus']>;
}
