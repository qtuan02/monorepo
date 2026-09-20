import { Button } from "@monorepo/ui/components/button";

/**
 * What the `react-error-boundary` in `~/pages/main.tsx` renders once the tree has
 * thrown. A full reload rather than a retry button: at this point the app's state
 * is of unknown validity, so re-rendering the same tree tends to throw straight
 * back.
 */
export default function InternalServerError() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-foreground text-[20px] font-semibold">
        Đã có lỗi xảy ra
      </h1>
      <p className="text-muted-foreground max-w-lg text-center">
        Ứng dụng gặp sự cố ngoài dự kiến. Vui lòng tải lại trang.
      </p>
      <Button className="mt-2" onClick={() => window.location.reload()}>
        Tải lại trang
      </Button>
    </div>
  );
}
