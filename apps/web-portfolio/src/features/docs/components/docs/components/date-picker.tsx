import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import DatePickerPreview from "./preview-client/date-picker-preview";

const importCode = `
"use client";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@web/web-ui/shadcn-ui/button";
import { Calendar } from "@web/web-ui/shadcn-ui/calendar";
import { Input } from "@web/web-ui/shadcn-ui/input";
import { Label } from "@web/web-ui/shadcn-ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@web/web-ui/shadcn-ui/popover";
import { useState } from "react";
`;

const usageCode = `
<div className="flex gap-4">
  <div className="flex flex-col gap-3">
    <Label htmlFor="date-picker" className="px-1">
      Date
    </Label>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date-picker"
          className="w-32 justify-between font-normal"
        >
          {date ? date.toLocaleDateString() : "Select date"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(date) => {
            setDate(date);
            setOpen(false);
        }}
        />
      </PopoverContent>
    </Popover>
  </div>
  <div className="flex flex-col gap-3">
    <Label htmlFor="time-picker" className="px-1">
      Time
    </Label>
    <Input
      type="time"
      id="time-picker"
      step="1"
      defaultValue="10:30:00"
      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
    />
  </div>
</div>
`;

const DatePicker = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="DatePicker" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <DatePickerPreview />
      </SectionPreview>

      <SectionCode title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionCode>
      <SectionCode title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionCode>
    </LayoutDocs>
  );
};

export default DatePicker;
