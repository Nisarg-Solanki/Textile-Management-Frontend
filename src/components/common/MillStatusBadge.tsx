import { Badge } from "@/components/ui/badge";

type Props = {
  millOutvertDate?: string | null;
  millInvertId?: string | null;
};

export function MillStatusBadge({ millOutvertDate, millInvertId }: Props) {
  if (!millOutvertDate) {
    return <Badge variant="secondary">Not Sent</Badge>;
  }
  if (!millInvertId) {
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">At Mill</Badge>;
  }
  return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Returned</Badge>;
}
