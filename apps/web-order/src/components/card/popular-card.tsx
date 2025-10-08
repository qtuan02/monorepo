import { Button } from "@web/web-ui/shadcn-ui/button";
import { NextImage } from "../next-image";
import { ShoppingBasket } from "lucide-react";
import { formatCurrency } from "~/utils/curency";

interface IPopularCardProps {
  imageSrc: string;
  name: string;
  price: number;
}

const PopularCard = ({ imageSrc, name, price }: IPopularCardProps) => {
  return (
    <div className="text-3xl flex font-semibold size-full bg-gray-50 rounded-md overflow-hidden border border-gray-100">
      <NextImage src={imageSrc} alt="dish" fill className="size-23 shrink-0" />
      <div className="py-1.5 pr-1.5 pl-3 flex flex-col justify-between ">
        <h4 className="line-clamp-2 text-base">{name}</h4>
        <div className="flex justify-between items-center">
          <p className="text-lg text-orange-500 font-medium">
            {formatCurrency(price)}
          </p>
          <Button
            size="icon"
            className="cursor-pointer size-7 bg-orange-600 hover:bg-orange-700"
          >
            <ShoppingBasket className="size-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { PopularCard };
