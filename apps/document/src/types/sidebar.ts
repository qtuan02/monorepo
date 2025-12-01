export interface SideBarItem {
  key: string;
  label: string;
  href: string;
}

export interface SideBarGroup {
  title: string;
  items: SideBarItem[];
}
