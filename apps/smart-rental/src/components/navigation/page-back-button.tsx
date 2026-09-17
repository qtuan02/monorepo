import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";

interface PageBackButtonProps {
  /** A path from `ROUTES` to go to instead of one step back in history. */
  to?: string;
  label?: string;
}

export function PageBackButton({
  to,
  label = "Quay lại",
}: PageBackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => (to ? navigate(to) : navigate(-1))}
    >
      <ArrowLeft />
      {label}
    </Button>
  );
}
