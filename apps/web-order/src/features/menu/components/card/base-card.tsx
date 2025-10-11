import { Button } from "@web/web-ui/shadcn-ui/button";
import { NextImage } from "../../../../components/next-image";
import { ShoppingBasket } from "lucide-react";
import { formatCurrency } from "~/utils/curency";
import { Separator } from "@web/web-ui/shadcn-ui/separator";

interface IBaseCardProps {
  imageSrc: string;
  name: string;
  price: number;
}

const BaseCard = ({ imageSrc, name, price }: IBaseCardProps) => {
  return (
    <div className="flex w-full h-24 select-none">
      <div className="size-24 shrink-0 bg-gray-500 rounded-md overflow-hidden">
        <NextImage src={imageSrc} alt="base-image" fill className="size-full" />
      </div>

      <div className="flex-1 h-full px-3 py-1 flex flex-col justify-between">
        <div className="flex flex-col">
          <h4>{name}</h4>
          <div className="flex text-sm text-gray-500 items-center">
            <span>26 đã bán</span>
            <Separator className="!h-4 mx-2" orientation="vertical" />
            <span>100 lượt thích</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-lg text-orange-500 font-medium">
            {formatCurrency(price)}
          </p>
          <Button
            size="icon"
            variant="outline"
            className="cursor-pointer size-7 border-orange-400"
          >
            <ShoppingBasket className="size-5 text-orange-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { BaseCard };
