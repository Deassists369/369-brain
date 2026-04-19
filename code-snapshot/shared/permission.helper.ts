import { NavGroup, NavItemsType, NavItemWithPermissionType } from '../types';
import { SideMenuInterface } from '../interfaces/sidemenu.interface';
import { UserTypes } from '../constants/user.types';
import { IUser } from '../interfaces/user.interface';
import * as _ from 'lodash';
import { CollectionNames } from '@constants/collections';
import UserHelper from '../helpers/user.helper';

let hasCourseListPermission: any = false;
let hasEverBeenRestricted = false;
export const exclusivePermission = (
  data: NavItemWithPermissionType[],
  user: IUser, //
  referredUser: IUser,
  agentUser: IUser,
) => {
  hasCourseListPermission = false;
  hasEverBeenRestricted = false;

  // If referredUser exists, calculate permission and persist it if it's true
  if (
    referredUser &&
    referredUser?.roles &&
    referredUser?.type !== UserTypes.USER &&
    referredUser?.type !== UserTypes.SUPER_ADMIN
  ) {
    hasCourseListPermission = referredUser.roles?.some((role: any) =>
      role.permissions.some(
        (perm: any) =>
          perm.collection === CollectionNames.Courses &&
          perm.actions.includes('list'),
      ),
    );
  }

  if (
    user?.type === UserTypes.USER &&
    agentUser &&
    agentUser?.roles &&
    (agentUser?.type == UserTypes.AGENT ||
      agentUser?.type == UserTypes.ORG_AGENT)
  ) {
    hasCourseListPermission = agentUser.roles?.some((role: any) =>
      role.permissions.some(
        (perm: any) =>
          perm.collection === CollectionNames.Courses &&
          perm.actions.includes('list'),
      ),
    );
  }

  if (user?.is_organization_user) {
    hasCourseListPermission = user?.organization?.[0]?.orgServices?.some(
      (item: any) => item.service === CollectionNames.Courses,
    );
  }

  const userType = [UserTypes.USER].includes(user.type)
    ? UserTypes.USER
    : user.type;

  const shouldRestrictCourses = (() => {
    if (user.type !== UserTypes.USER) return false;

    const referredByNonUser =
      user?.referred_by && user?.referred_by?.type !== UserTypes.USER;
    const linkedToAgent =
      user?.agentId &&
      agentUser &&
      [UserTypes.AGENT, UserTypes.ORG_AGENT].includes(agentUser?.type);

    return user.is_organization_user || referredByNonUser || linkedToAgent;
  })();

  // Update the persistent variable if restriction applies this time
  if (shouldRestrictCourses) {
    hasEverBeenRestricted = true;
  }

  const filtered = data
    .map((x) => {
      const newItem = _.cloneDeep(x) as NavGroup;

      // if (
      //   userType === UserTypes.USER &&
      //   ((Boolean(user?.referred_by) &&
      //     user?.referred_by?.type !== UserTypes.USER) ||
      //     (Boolean(user?.agentId) &&
      //       (agentUser?.type == UserTypes.AGENT ||
      //         agentUser?.type == UserTypes.ORG_AGENT)) ||
      //     Boolean(user?.is_organization_user)) &&
      //   !hasCourseListPermission &&
      //   newItem?.title === 'Programs & Courses'
      // )
      //   return null;

      // Exclude "Programs & Courses" for restricted users
      if (
        newItem?.title?.trim() === 'Programs & Courses' &&
        hasEverBeenRestricted &&
        !hasCourseListPermission
      ) {
        return null;
      }

      if ('children' in x && x.children?.length && x.children?.length > 0) {
        // console.log('weird', x.title, x.children, x.children?.length);
        if (userType === UserTypes.SUPER_ADMIN) newItem.children = x.children;
        else {
          newItem.children = newItem.children?.filter((child: any) => {
            if (
              !UserHelper.isDefaultOrgUser(
                userType as UserTypes,
                user?.organization?.[0]?.name ?? '',
              ) &&
              child?.title === 'De Assists Agents'
            ) {
              return false;
            }
            // Show childern also based on permission level
            let isPermitted = true;

            if (
              child.permissionLevel === null ||
              child.permissionLevel === undefined
            ) {
              isPermitted = true;
            } else {
              isPermitted = child.permissionLevel.some(
                (x: any) => x === userType,
              );
            }

            // Always return if path includes "page-workinprogress" and isPermitted
            // Also skip collection check when child has an explicit permissionLevel and user is permitted
            if (
              (child.path?.includes('page-workinprogress') ||
                child.permissionLevel != null) &&
              isPermitted
            ) {
              // Filter grandchildren (3rd level) by permissionLevel before returning
              if (child.children && child.children.length > 0) {
                child.children = child.children.filter((grandchild: any) => {
                  if (
                    grandchild.permissionLevel === null ||
                    grandchild.permissionLevel === undefined
                  ) {
                    return true;
                  }
                  return grandchild.permissionLevel.some(
                    (p: any) => p === userType,
                  );
                });
              }
              return true;
            }

            return (
              child.path &&
              user.roles?.some((role) =>
                role.permissions.some((perm) => {
                  const match = child.path.includes(perm.collection);
                  if (isPermitted) {
                    return match;
                  } else {
                    return false; // You need to return a boolean value here
                  }
                }),
              )
            );
          });
        }

        // console.log('x.children', x.children, x.children?.length);
      }

      const permitted =
        x.permissionLevel?.includes(UserTypes.ALL) ||
        x.permissionLevel?.some((x) => x === userType);

      if (permitted) return newItem;

      const item = x as any;
      if (
        item.path &&
        user.type !== UserTypes.SUPER_ADMIN &&
        !user.roles?.some(
          (role) =>
            !role.permissions?.some((perm) => {
              perm.collection.includes(item.path);
            }),
        )
      )
        return null;

      return null;
    })
    .filter((x) => x !== null);

  const ok = filtered
    .map((x) => {
      if (!x) return;
      const { permissionLevel, ...rest } = x;
      return rest;
    })
    .filter(Boolean) as NavItemsType;

  // console.log(ok);
  return ok;
};

export const includedPermission = (
  data: Partial<{ permissionLevel: number[] }>[],
  userPermission: number,
) => data.filter((x) => x.permissionLevel?.some((x) => x >= userPermission));

export const transform = (menus: SideMenuInterface[]): SideMenuInterface[] => {
  const prependPath = (
    data: SideMenuInterface[],
    link: string,
  ): SideMenuInterface[] => {
    return data.map((x) => {
      x.path = `${link}${x.path}`;
      if (x.children) {
        x.children = prependPath(x.children, x.path);
      }
      return x;
    });
  };

  return menus?.map((parent) => {
    if (parent.children && parent.path) {
      parent.children = prependPath(parent.children, parent.path);
    }
    return parent;
  });
};
