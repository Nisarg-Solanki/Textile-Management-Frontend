"use client";

import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import type { PermissionRow } from "@/types/app";

const MODULES = [
  { key: "firms", label: "Firms" },
  { key: "mills", label: "Mills" },
  { key: "beam_qualities", label: "Beam Qualities" },
  { key: "production_qualities", label: "Production Qualities" },
  { key: "machines", label: "Machines" },
  { key: "beams", label: "Beams" },
  { key: "production", label: "Production" },
  { key: "takas", label: "Takas" },
  { key: "mill_outverts", label: "Mill Outverts" },
  { key: "mill_inverts", label: "Mill Inverts" },
  { key: "machine_info", label: "Machine Info" },
  { key: "mill_summary", label: "Mill Summary" },
] as const;

type ModuleKey = (typeof MODULES)[number]["key"];

const ACTIONS = ["canView", "canCreate", "canEdit", "canDelete"] as const;
type Action = (typeof ACTIONS)[number];

const ACTION_LABELS: Record<Action, string> = {
  canView: "View",
  canCreate: "Create",
  canEdit: "Edit",
  canDelete: "Delete",
};

function buildPermissions(raw: PermissionRow[]): PermissionRow[] {
  return MODULES.map(({ key }) => {
    const existing = raw.find((p) => p.module === key);
    return (
      existing ?? {
        module: key,
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      }
    );
  });
}

type Props<TFieldValues extends FieldValues = FieldValues> = {
  control: Control<TFieldValues>;
  name: string;
};

export function PermissionMatrix<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
}: Props<TFieldValues>) {
  const { field } = useController({
    control,
    name: name as FieldPath<TFieldValues>,
  });

  const raw: PermissionRow[] = Array.isArray(field.value)
    ? (field.value as PermissionRow[])
    : [];

  const permissions = buildPermissions(raw);

  function getCell(moduleKey: ModuleKey, action: Action): boolean {
    return permissions.find((p) => p.module === moduleKey)?.[action] ?? false;
  }

  function setCell(moduleKey: ModuleKey, action: Action, checked: boolean): void {
    const updated = permissions.map((p) =>
      p.module === moduleKey ? { ...p, [action]: checked } : p,
    );
    field.onChange(updated);
  }

  function setRow(moduleKey: ModuleKey, checked: boolean): void {
    const updated = permissions.map((p) =>
      p.module === moduleKey
        ? {
            ...p,
            canView: checked,
            canCreate: checked,
            canEdit: checked,
            canDelete: checked,
          }
        : p,
    );
    field.onChange(updated);
  }

  function setColumn(action: Action, checked: boolean): void {
    const updated = permissions.map((p) => ({ ...p, [action]: checked }));
    field.onChange(updated);
  }

  function rowCheckedState(moduleKey: ModuleKey): boolean | "indeterminate" {
    const vals = ACTIONS.map((a) => getCell(moduleKey, a));
    if (vals.every(Boolean)) return true;
    if (vals.some(Boolean)) return "indeterminate";
    return false;
  }

  function colCheckedState(action: Action): boolean | "indeterminate" {
    const vals = MODULES.map(({ key }) => getCell(key, action));
    if (vals.every(Boolean)) return true;
    if (vals.some(Boolean)) return "indeterminate";
    return false;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-48 px-4 py-3 text-left font-medium text-muted-foreground">
              Module
            </th>
            {ACTIONS.map((action) => (
              <th
                key={action}
                className="w-24 px-4 py-3 text-center font-medium text-muted-foreground"
              >
                {ACTION_LABELS[action]}
              </th>
            ))}
            <th className="w-24 px-4 py-3 text-center font-medium text-muted-foreground">
              All
            </th>
          </tr>
          <tr className="border-b bg-muted/20">
            <td className="px-4 py-2 text-xs font-medium text-muted-foreground">
              Select All
            </td>
            {ACTIONS.map((action) => (
              <td key={action} className="px-4 py-2 text-center">
                <Checkbox
                  checked={colCheckedState(action)}
                  onCheckedChange={(checked) =>
                    setColumn(action, checked === true)
                  }
                  aria-label={`Select all ${ACTION_LABELS[action]}`}
                />
              </td>
            ))}
            <td />
          </tr>
        </thead>
        <tbody>
          {MODULES.map(({ key, label }, idx) => (
            <tr
              key={key}
              className={
                idx % 2 === 0
                  ? "border-b last:border-0"
                  : "border-b bg-muted/10 last:border-0"
              }
            >
              <td className="px-4 py-2 font-medium">{label}</td>
              {ACTIONS.map((action) => (
                <td key={action} className="px-4 py-2 text-center">
                  <Checkbox
                    checked={getCell(key, action)}
                    onCheckedChange={(checked) =>
                      setCell(key, action, checked === true)
                    }
                    aria-label={`${label} ${ACTION_LABELS[action]}`}
                  />
                </td>
              ))}
              <td className="px-4 py-2 text-center">
                <Checkbox
                  checked={rowCheckedState(key)}
                  onCheckedChange={(checked) => setRow(key, checked === true)}
                  aria-label={`Select all for ${label}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
