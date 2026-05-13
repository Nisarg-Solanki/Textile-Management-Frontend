import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = "Something went wrong",
  onRetry,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <AlertCircle className="size-12 text-destructive" />
      <p className="text-lg font-semibold">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  );
}
