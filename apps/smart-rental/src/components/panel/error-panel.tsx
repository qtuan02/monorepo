import { AlertCircle } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@monorepo/ui/components/alert";
import { Button } from "@monorepo/ui/components/button";

interface ErrorPanelProps {
  title?: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function ErrorPanel({
  title = "Lỗi",
  description,
  action,
  className,
}: ErrorPanelProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {action && (
        <AlertAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
