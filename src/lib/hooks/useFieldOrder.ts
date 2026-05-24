"use client";

import { useEffect, useState } from "react";

function storageKey(formId: string) {
  return `form:order:${formId}`;
}

function reconcile(saved: string[], ids: string[]): string[] {
  const known = new Set(ids);
  const filtered = saved.filter((id) => known.has(id));
  const missing = ids.filter((id) => !filtered.includes(id));
  return [...filtered, ...missing];
}

function loadOrder(formId: string, ids: string[]): string[] {
  if (typeof window === "undefined") return ids;
  try {
    const raw = window.localStorage.getItem(storageKey(formId));
    if (!raw) return ids;
    const saved = JSON.parse(raw) as unknown;
    if (!Array.isArray(saved)) return ids;
    const strings = saved.filter((id): id is string => typeof id === "string");
    return reconcile(strings, ids);
  } catch {
    return ids;
  }
}

export function useFieldOrder(formId: string, defaultIds: string[]) {
  const key = defaultIds.join("|");

  const [order, setOrder] = useState<string[]>(() =>
    loadOrder(formId, defaultIds),
  );

  useEffect(() => {
    const ids = key ? key.split("|") : [];
    setOrder((prev) => {
      const next = reconcile(prev, ids);
      if (
        next.length === prev.length &&
        next.every((id, i) => id === prev[i])
      ) {
        return prev;
      }
      return next;
    });
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey(formId), JSON.stringify(order));
    } catch {
      // ignore quota errors
    }
  }, [formId, order]);

  return [order, setOrder] as const;
}
