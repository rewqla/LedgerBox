export type NavigationLeaf = {
  kind: 'leaf';
  label: string;
  href: string;
};

export type NavigationGroup = {
  kind: 'group';
  label: string;
  items: NavigationLeaf[];
  disabled?: boolean;
  badge?: string;
};

export type NavigationItem = NavigationLeaf | NavigationGroup;

export const APP_NAVIGATION: NavigationItem[] = [
  {
    kind: 'leaf',
    label: 'Дашборд',
    href: '/dashboard'
  },
  {
    kind: 'group',
    label: 'Монети',
    items: [
      {
        kind: 'leaf',
        label: 'Колекція',
        href: '/coins/collection'
      },
      {
        kind: 'leaf',
        label: 'Бажанки',
        href: '/coins/wishlist'
      }
    ]
  },
  {
    kind: 'group',
    label: 'ОВДП',
    items: [],
    disabled: true,
    badge: 'скоро'
  }
];

export function isLeafActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isGroupActive(pathname: string, item: NavigationGroup): boolean {
  return item.items.some((child) => isLeafActive(pathname, child.href));
}

export function isGroupExpanded(pathname: string, item: NavigationGroup): boolean {
  if (item.disabled) {
    return false;
  }

  return isGroupActive(pathname, item);
}

export function findActiveLabel(pathname: string): string {
  for (const item of APP_NAVIGATION) {
    if (item.kind === 'leaf' && isLeafActive(pathname, item.href)) {
      return item.label;
    }

    if (item.kind === 'group') {
      const activeChild = item.items.find((child) => isLeafActive(pathname, child.href));

      if (activeChild) {
        return activeChild.label;
      }
    }
  }

  return 'LedgerBox';
}
