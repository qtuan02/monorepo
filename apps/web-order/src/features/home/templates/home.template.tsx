import { Button } from "@web/web-ui/shadcn-ui/button";
import { NotebookPen } from "lucide-react";
import { OptionButton } from "../components/button/option-button";

export default function HomeTemplate() {
  return (
    <main className="size-full p-4">
      <p className="text-center text-gray-500 px-6 mt-4">
        Quý khách đang truy cập vào hệ thống Web Order tại nhà hàng
      </p>
      <div className="flex-center flex-col gap-y-3 py-6">
        <h2 className="text-xl font-semibold text-orange-600">
          Cửu Vân Long - Parc Mall
        </h2>
        <p className="text-gray-500 text-center px-2">
          Tầng 3, TTTM PARC MALL, Số 547 - 549, đường Tạ Quang Bửu, phường 4,
          Quận 8, TP. HCM
        </p>
      </div>

      <div className="flex-center flex-col gap-y-3 py-6">
        <Button
          variant="ghost"
          className="text-2xl font-semibold text-orange-600 border-b-4 border-orange-600 h-16 rounded-xl px-6"
        >
          BÀN B1
        </Button>
        <p className="text-gray-500 text-lg px-6 text-center">
          Nào cùng khám phá và trải nghiệm tốt nhất
        </p>
      </div>

      <div className="flex-center flex-wrap gap-6 px-6 py-20">
        <OptionButton
          title="Gọi món"
          icon={<NotebookPen className="size-6 text-white" />}
          redirectTo="/menu"
        />
      </div>
    </main>
  );
}
