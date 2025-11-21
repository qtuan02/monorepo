import {
  CalendarRange,
  Download,
  Github,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { BorderBeam } from "@monorepo/ui/animate-ui/border-beam";
import { SpringElement } from "@monorepo/ui/animate-ui/element-spring";
import { HighlightText } from "@monorepo/ui/animate-ui/text-highlight";

import NextLink from "~/components/next-link";
import CardSection from "../card/card-section";

const AsideLeft = () => {
  const t = useTranslations("About");

  return (
    <>
      <SpringElement>
        <CardSection className="flex flex-col items-center gap-y-2">
          <div className="flex size-24 items-center justify-center rounded-full bg-orange-400 text-4xl font-bold text-white select-none md:size-36 md:text-6xl">
            HT
          </div>
          <p className="text-xl font-bold md:text-2xl">Huỳnh Quốc Tuấn</p>
          <p className="text-sm text-gray-500 md:text-base">
            Developer Frontend
          </p>
          <HighlightText className="!flex cursor-pointer items-center gap-x-2 rounded-lg !from-orange-300 !to-orange-500 px-4 py-1 text-white">
            <Download className="size-4" />
            <span>{t("download_cv")}</span>
          </HighlightText>
        </CardSection>
      </SpringElement>

      <CardSection className="relative flex flex-col gap-y-4 overflow-hidden">
        <h2 className="text-lg font-medium">{t("contact_info")}</h2>
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-2">
            <Mail className="size-4 text-orange-500" />
            <p className="text-sm text-gray-500 md:text-base">
              huynhquoctuan200702@gmail.com
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <Phone className="size-4 text-orange-500" />
            <p className="text-sm text-gray-500 md:text-base">
              (+84) 393 653 862
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <MapPin className="size-4 text-orange-500" />
            <p className="text-sm text-gray-500 md:text-base">{t("address")}</p>
          </div>
          <div className="flex items-center gap-x-2">
            <CalendarRange className="size-4 text-orange-500" />
            <p className="text-sm text-gray-500 md:text-base">20/07/2002</p>
          </div>
          <div className="flex items-center gap-x-2">
            <Github className="size-4 text-orange-500" />
            <p className="text-sm text-gray-500 md:text-base">
              <NextLink href="https://github.com/qtuan02" isExternalLink>
                https://github.com/qtuan02
              </NextLink>
            </p>
          </div>
        </div>

        <BorderBeam duration={8} size={100} />
      </CardSection>
    </>
  );
};

export default AsideLeft;
