"use client";

import { Fragment, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { roleRecords } from "@/data/userManagementData";
import { buildSidebarPrivilegeTree, allPrivilegeIds, type PrivilegeNode } from "@/lib/sidebarPrivileges";

const privilegeTree = buildSidebarPrivilegeTree();
const everyPrivilegeId = allPrivilegeIds(privilegeTree);

export default function ManageRolesPanel() {
  const [roles, setRoles] = useState(roleRecords);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // Admin-type roles start with full access; everything else starts blank so
  // the admin explicitly grants each sidebar element.
  const [privileges, setPrivileges] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(
      roleRecords.map((role) => [role.roleName, new Set(role.roleType === "Admin" ? everyPrivilegeId : [])])
    )
  );

  function togglePrivilege(roleName: string, id: string) {
    setPrivileges((prev) => {
      const current = new Set(prev[roleName] ?? []);
      if (current.has(id)) current.delete(id);
      else current.add(id);
      return { ...prev, [roleName]: current };
    });
  }

  function toggleSelected(roleName: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(roleName)) next.delete(roleName);
      else next.add(roleName);
      return next;
    });
  }

  function handleDelete() {
    setRoles((prev) => prev.filter((role) => !selected.has(role.roleName)));
    setSelected(new Set());
    if (expandedRole && selected.has(expandedRole)) setExpandedRole(null);
  }

  function handleNew() {
    const name = `New Role ${roles.length + 1}`;
    setRoles((prev) => [...prev, { roleName: name, roleType: "Admin" }]);
    setPrivileges((prev) => ({ ...prev, [name]: new Set() }));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Manage Roles</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-brand-blue-light text-[11px] uppercase tracking-wide text-heading/70">
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Role Name</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Role Type</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold" />
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, index) => {
                const isExpanded = expandedRole === role.roleName;
                const grantedCount = privileges[role.roleName]?.size ?? 0;
                return (
                  <Fragment key={role.roleName}>
                    <tr className={index % 2 === 0 ? "bg-panel" : "bg-brand-green-light/30"}>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <button className="font-medium text-brand-blue hover:underline">{role.roleName}</button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{role.roleType}</td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <button
                          onClick={() => setExpandedRole(isExpanded ? null : role.roleName)}
                          className="flex items-center gap-1 font-medium text-brand-blue hover:underline"
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          Privilege
                          <span className="text-xs font-normal text-heading/50">
                            ({grantedCount}/{everyPrivilegeId.length})
                          </span>
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={selected.has(role.roleName)}
                          onChange={() => toggleSelected(role.roleName)}
                          className="h-4 w-4 rounded border-border text-brand-blue focus:ring-brand-blue"
                        />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-surface">
                        <td colSpan={4} className="px-4 py-4">
                          <PrivilegeEditor
                            roleName={role.roleName}
                            granted={privileges[role.roleName] ?? new Set()}
                            onToggle={(id) => togglePrivilege(role.roleName, id)}
                            onSelectAll={() =>
                              setPrivileges((prev) => ({ ...prev, [role.roleName]: new Set(everyPrivilegeId) }))
                            }
                            onClearAll={() =>
                              setPrivileges((prev) => ({ ...prev, [role.roleName]: new Set() }))
                            }
                            onClose={() => setExpandedRole(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-heading/80 hover:bg-border"
          >
            <Plus size={14} />
            New
          </button>
          <button
            onClick={handleDelete}
            disabled={selected.size === 0}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-heading/80 hover:bg-border disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PrivilegeEditor({
  roleName,
  granted,
  onToggle,
  onSelectAll,
  onClearAll,
  onClose,
}: {
  roleName: string;
  granted: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-heading">Sidebar access for &ldquo;{roleName}&rdquo;</p>
        <div className="flex items-center gap-2">
          <button onClick={onSelectAll} className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-heading/70 hover:bg-border">
            Select All
          </button>
          <button onClick={onClearAll} className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-heading/70 hover:bg-border">
            Clear All
          </button>
          <button onClick={onClose} className="rounded-lg bg-heading px-3 py-1 text-xs font-semibold text-white hover:bg-heading/90">
            Done
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {privilegeTree.map((group) => (
          <div key={group.heading} className="rounded-lg border border-border/60 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-heading/60">{group.heading}</p>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <PrivilegeNodeRow key={item.id} node={item} granted={granted} onToggle={onToggle} depth={0} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivilegeNodeRow({
  node,
  granted,
  onToggle,
  depth,
}: {
  node: PrivilegeNode;
  granted: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
}) {
  return (
    <div style={{ marginLeft: depth * 14 }}>
      <label className="flex items-center gap-2 text-sm text-heading/80">
        <input
          type="checkbox"
          checked={granted.has(node.id)}
          onChange={() => onToggle(node.id)}
          className="h-3.5 w-3.5 rounded border-border text-brand-blue focus:ring-brand-blue"
        />
        {node.label}
      </label>
      {node.children?.map((child) => (
        <PrivilegeNodeRow key={child.id} node={child} granted={granted} onToggle={onToggle} depth={depth + 1} />
      ))}
    </div>
  );
}
