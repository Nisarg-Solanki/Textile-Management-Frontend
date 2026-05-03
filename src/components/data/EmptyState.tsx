import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon: Icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      {Icon && <Icon className="size-12 text-muted-foreground" />}
      <p className="text-lg font-semibold">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
