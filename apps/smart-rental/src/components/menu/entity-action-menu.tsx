import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@monorepo/ui/components/dropdown-menu";

export interface EntityActionMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  /** A path from `ROUTES`; navigated on click. */
  link?: string;
  onClick?: () => void;
  isDestructive?: boolean;
}

interface EntityActionMenuProps {
  items: EntityActionMenuItem[];
  label?: string;
  side?: "top" | "bottom" | "left" | "right";
}

/** The "⋯" menu of a row or card. An item with neither a link nor a handler is disabled. */
export function EntityActionMenu({
  items,
  label = "Thao tác",
  side = "bottom",
}: EntityActionMenuProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={label}
          >
            <MoreHorizontal />
          </Button>
        }
      />
      <DropdownMenuContent align="end" side={side} className="w-44">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuItem
              key={item.key}
              variant={item.isDestructive ? "destructive" : "default"}
              disabled={!item.link && !item.onClick}
              onClick={() => {
                if (item.link) navigate(item.link);
                else item.onClick?.();
              }}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
