import CardSection from "../card/card-section";
import {
  CalendarRange,
  Download,
  Github,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import NextLink from "~/components/next-link";
import { useTranslations } from "next-intl";
import { HighlightText } from "@monorepo/ui/animate-ui/text-highlight";
import { SpringElement } from "@monorepo/ui/animate-ui/element-spring";
import { BorderBeam } from "@monorepo/ui/animate-ui/border-beam";

const AsideLeft = () => {
  const t = useTranslations("About");

  return (
    <>
      <SpringElement>
        <CardSection className="flex flex-col gap-y-2 items-center">
          <div className="bg-orange-400 rounded-full size-24 md:size-36 font-bold text-4xl md:text-6xl flex items-center justify-center text-white select-none">
            HT
          </div>
          <p className="text-xl md:text-2xl font-bold">Huỳnh Quốc Tuấn</p>
          <p className=" text-gray-500 text-sm md:text-base">
            Developer Frontend
          </p>
          <HighlightText className="!flex items-center gap-x-2 text-white px-4 py-1 rounded-lg cursor-pointer !from-orange-300 !to-orange-500">
            <Download className="size-4" />
            <span>{t("download_cv")}</span>
          </HighlightText>
        </CardSection>
      </SpringElement>

      <CardSection className="flex flex-col gap-y-4 relative overflow-hidden">
        <h2 className="text-lg font-medium">{t("contact_info")}</h2>
        <div className="flex flex-col gap-y-2">
          <div className="flex gap-x-2 items-center">
            <Mail className="size-4 text-orange-500" />
            <p className="text-gray-500 text-sm md:text-base">
              huynhquoctuan200702@gmail.com
            </p>
          </div>
          <div className="flex gap-x-2 items-center">
            <Phone className="size-4 text-orange-500" />
            <p className="text-gray-500 text-sm md:text-base">
              (+84) 393 653 862
            </p>
          </div>
          <div className="flex gap-x-2 items-center">
            <MapPin className="size-4 text-orange-500" />
            <p className="text-gray-500 text-sm md:text-base">{t("address")}</p>
          </div>
          <div className="flex gap-x-2 items-center">
            <CalendarRange className="size-4 text-orange-500" />
            <p className="text-gray-500 text-sm md:text-base">20/07/2002</p>
          </div>
          <div className="flex gap-x-2 items-center">
            <Github className="size-4 text-orange-500" />
            <p className="text-gray-500 text-sm md:text-base">
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
