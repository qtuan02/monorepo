import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

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

/** One mẫu tin: channel tile, preview, and a "Gửi ngay" that only simulates the send (no backend yet). */
export default function TemplateCard({ template }: TemplateCardProps) {
  const [isSent, setIsSent] = useState(false);
  const channel = channelConfig[template.channel];
  const ChannelIcon = channel.icon;

  const send = () => {
    setIsSent(true);
    toast.add({
      title: "Đã mô phỏng gửi thông báo",
      description: template.name,
      type: "success",
    });
    setTimeout(() => setIsSent(false), SENT_FLASH_MS);
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
              <p className="text-muted-foreground mt-1 line-clamp-1 text-[11px]">
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
          <div className="bg-muted/50 text-muted-foreground ring-border/50 rounded-xl p-3 font-mono text-[11px] leading-relaxed ring-1 ring-inset">
            {template.preview}
          </div>
        </CardContent>
      }
      footer={
        <CardFooter>
          <Button
            type="button"
            size="sm"
            variant={isSent ? "secondary" : "default"}
            disabled={isSent}
            onClick={send}
            className="w-full"
          >
            {isSent ? (
              <>
                <CheckCircle2 className="text-emerald-500" />
                Đã gửi!
              </>
            ) : (
              <>
                <Send />
                Gửi ngay
              </>
            )}
          </Button>
        </CardFooter>
      }
    />
  );
}
