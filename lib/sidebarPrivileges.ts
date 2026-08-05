import { navGroups, type NavSubItem } from "@/data/staticData";

export interface PrivilegeNode {
  id: string;
  label: string;
  children?: PrivilegeNode[];
}

export interface PrivilegeGroup {
  heading: string;
  items: PrivilegeNode[];
}

function fromSubItem(parentId: string, sub: NavSubItem): PrivilegeNode {
  const id = sub.tabKey ?? `${parentId}::${sub.label}`;
  return {
    id,
    label: sub.label,
    children: sub.submenu?.map((nested) => fromSubItem(id, nested)),
  };
}

// Flattens the sidebar's nav groups (data/staticData.ts) into a tree of
// checkable nodes, so role privilege editing always reflects the real menu.
export function buildSidebarPrivilegeTree(): PrivilegeGroup[] {
  return navGroups.map((group) => ({
    heading: group.heading,
    items: group.items.map((item) => {
      const id = item.tabKey ?? item.label;
      return {
        id,
        label: item.label,
        children: item.submenu?.map((sub) => fromSubItem(id, sub)),
      };
    }),
  }));
}

export function allPrivilegeIds(tree: PrivilegeGroup[]): string[] {
  const ids: string[] = [];
  function walk(node: PrivilegeNode) {
    ids.push(node.id);
    node.children?.forEach(walk);
  }
  tree.forEach((group) => group.items.forEach(walk));
  return ids;
}
