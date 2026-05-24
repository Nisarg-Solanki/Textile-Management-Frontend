"use client";

import { useCallback } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Field = { id: string; label: string };

type Props = {
  fields: Field[];
  order: string[];
  onOrderChange: (next: string[]) => void;
};

export function FieldOrderButton({ fields, order, onOrderChange }: Props) {
  const moveField = useCallback(
    (id: string, direction: -1 | 1) => {
      const idx = order.indexOf(id);
      if (idx === -1) return;
      const target = idx + direction;
      if (target < 0 || target >= order.length) return;
      const next = [...order];
      [next[idx], next[target]] = [next[target], next[idx]];
      onOrderChange(next);
    },
    [order, onOrderChange],
  );

  const orderedFields = order
    .map((id) => fields.find((f) => f.id === id))
    .filter((f): f is Field => !!f);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
        >
          <ArrowUpDown className="size-4" />
          Order
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Field Order</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orderedFields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-center gap-1 px-2 py-1 text-sm"
          >
            <span className="flex-1 truncate pl-2 pr-2">{field.label}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              aria-label="Move field up"
              disabled={index === 0}
              onClick={(e) => {
                e.preventDefault();
                moveField(field.id, -1);
              }}
            >
              <ArrowUp className="size-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              aria-label="Move field down"
              disabled={index === orderedFields.length - 1}
              onClick={(e) => {
                e.preventDefault();
                moveField(field.id, 1);
              }}
            >
              <ArrowDown className="size-3" />
            </Button>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
