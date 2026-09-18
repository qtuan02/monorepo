import { useEffect, useState } from "react";
import { CheckCircle2, MessageSquareText } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { toast } from "@monorepo/ui/components/toast";
import { cn } from "@monorepo/ui/utils/cn";

import type { NotificationTemplate } from "~/types/communication";
import { EntityListCard } from "~/components/card/entity-list-card";
import { channelConfig } from "~/constants/status";

const SENT_FLASH_MS = 2000;

interface TemplateCardProps {
  template: NotificationTemplate;
}

/**
 * One mẫu tin: channel tile, preview, and a single "Dùng mẫu" (spec #153
 * §10 row 26 — Gửi nhắc is a log on Hoá đơn, not a send from here; this
 * button only points the landlord at where to send it, it never sends).
 */
export default function TemplateCard({ template }: TemplateCardProps) {
  const [isUsed, setIsUsed] = useState(false);
  const channel = channelConfig[template.channel];
  const ChannelIcon = channel.icon;

  // The timer is an external system: it clears if the card unmounts mid-flash
  // (a channel filter switch), rather than firing setState on a gone component.
  useEffect(() => {
    if (!isUsed) return;
    const timer = setTimeout(() => setIsUsed(false), SENT_FLASH_MS);
    return () => clearTimeout(timer);
  }, [isUsed]);

  const useTemplate = () => {
    setIsUsed(true);
    toast.add({
      title: `Đã dùng mẫu — ${template.name}`,
      description: "Chọn Hoá đơn cần nhắc trong màn Hoá đơn để gửi.",
    });
  };

  return (
    <EntityListCard
      className="flex flex-col"
      header={
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-sm font-bold">
                {template.name}
              </CardTitle>
              <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                {template.description}
              </p>
            </div>
            <div
              className={cn(
                "shrink-0 rounded-lg p-1.5 [&_svg]:size-4",
                channel.className,
              )}
              title={channel.label}
            >
              {ChannelIcon && <ChannelIcon />}
            </div>
          </div>
        </CardHeader>
      }
      content={
        <CardContent className="flex-1">
          <div className="bg-muted/50 text-muted-foreground ring-border/50 rounded-xl p-3 font-mono text-xs leading-relaxed ring-1 ring-inset">
            {template.preview}
          </div>
        </CardContent>
      }
      footer={
        <CardFooter>
          <Button
            type="button"
            size="sm"
            variant={isUsed ? "secondary" : "default"}
            disabled={isUsed}
            onClick={useTemplate}
            className="w-full"
          >
            {isUsed ? (
              <>
                <CheckCircle2 className="text-success" />
                Đã dùng!
              </>
            ) : (
              <>
                <MessageSquareText />
                Dùng mẫu
              </>
            )}
          </Button>
        </CardFooter>
      }
    />
  );
}
