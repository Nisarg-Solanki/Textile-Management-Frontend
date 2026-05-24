"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FieldOrderButton } from "@/components/common/FieldOrderButton";
import {
  HEADER_ACTIONS_SLOT_ID,
} from "@/components/layout/PageHeader";
import { useFieldOrder } from "@/lib/hooks/useFieldOrder";
import { cn } from "@/lib/utils/cn";

type Field = {
  id: string;
  label: string;
  fullWidth?: boolean;
  render: () => ReactNode;
};

type Props = {
  formId: string;
  fields: Field[];
  // Optional superset of IDs (including conditionally hidden ones) used to
  // persist order across visibility toggles. Defaults to fields.map(f => f.id).
  allFieldIds?: string[];
  gridCols?: 2 | 3;
};

export function OrderedFields({
  formId,
  fields,
  allFieldIds,
  gridCols = 2,
}: Props) {
  const idsForOrder = useMemo(
    () => allFieldIds ?? fields.map((f) => f.id),
    [allFieldIds, fields],
  );
  const [order, setOrder] = useFieldOrder(formId, idsForOrder);
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHeaderSlot(document.getElementById(HEADER_ACTIONS_SLOT_ID));
  }, []);

  const orderedFields = order
    .map((id) => fields.find((f) => f.id === id))
    .filter((f): f is Field => !!f);

  const gridClass = gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  const fullSpanClass = gridCols === 3 ? "md:col-span-3" : "md:col-span-2";

  const orderButton = (
    <FieldOrderButton
      fields={fields.map((f) => ({ id: f.id, label: f.label }))}
      order={order}
      onOrderChange={setOrder}
    />
  );

  return (
    <>
      {headerSlot && createPortal(orderButton, headerSlot)}
      <div className={cn("grid grid-cols-1 gap-4", gridClass)}>
        {orderedFields.map((field) => {
          const content = field.render();
          if (content === null || content === undefined || content === false) {
            return null;
          }
          return (
            <div
              key={field.id}
              className={field.fullWidth ? fullSpanClass : ""}
            >
              {content}
            </div>
          );
        })}
      </div>
    </>
  );
}
