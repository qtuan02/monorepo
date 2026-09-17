import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Car,
  CheckCircle2,
  FileBadge,
  ScanLine,
  Upload,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Spinner } from "@monorepo/ui/components/spinner";
import { toast } from "@monorepo/ui/components/toast";

import type {
  TenantFormInput,
  TenantFormValues,
} from "~/features/tenants/types/tenant-form";
import { TextField } from "~/components/form/text-field";
import { ROUTES } from "~/constants/routes";
import { tenantFormSchema } from "~/features/tenants/types/tenant-form";
import { useCreateTenant } from "~/hooks/api/tenant";
import { useBuildingStore } from "~/stores/use-building-store";

const FORM_ID = "tenant-form";
const SCAN_DELAY_MS = 2000;

/** What the pretend OCR "reads" off the card, as in the prototype. */
const scannedIdentity = {
  fullName: "NGUYỄN VĂN A",
  idCard: "012345678912",
  dob: "1990-01-01",
  hometown: "Quận 1, TP. Hồ Chí Minh",
};

/**
 * "Thêm Người thuê mới": the identity block is filled by a simulated CCCD
 * scan (a two-second wait, then fixed values — the prototype's stand-in for
 * OCR) and stays editable; the rest is typed. Submit writes into the Mock and
 * lands back on the list.
 */
export default function TenantCreateTemplate() {
  const navigate = useNavigate();
  const [scan, setScan] = useState<"idle" | "scanning" | "done">("idle");
  // Stamped onto the new Người thuê so the list, filtered by the same scope,
  // shows it the moment the toast does.
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const createTenant = useCreateTenant();
  const form = useForm<TenantFormInput, unknown, TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      fullName: "",
      idCard: "",
      dob: "",
      hometown: "",
      phone: "",
      email: "",
      vehicleType: "",
      vehiclePlate: "",
    },
  });

  const handleScan = () => {
    setScan("scanning");
    setTimeout(() => {
      setScan("done");
      form.reset({ ...form.getValues(), ...scannedIdentity });
    }, SCAN_DELAY_MS);
  };

  const onSubmit = form.handleSubmit((values) => {
    createTenant.mutate(
      { ...values, buildingId: selectedBuildingId ?? undefined },
      {
        onSuccess: (tenant) => {
          toast.add({
            title: `Đã thêm Người thuê ${tenant.name}`,
            type: "success",
          });
          navigate(ROUTES.TENANTS);
        },
      },
    );
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Thêm Người thuê mới
          </h1>
          <p className="text-muted-foreground">
            Nhập thông tin chi tiết hồ sơ Người thuê
          </p>
        </div>
        <Link
          to={ROUTES.TENANTS}
          className={buttonVariants({ variant: "outline" })}
        >
          Hủy
        </Link>
      </div>

      <form id={FORM_ID} onSubmit={onSubmit} noValidate className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBadge className="text-primary size-5" />
              Định danh (CCCD)
            </CardTitle>
            <CardDescription>
              Sử dụng OCR để trích xuất thông tin nhanh chóng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scan === "done" ? (
              <div className="flex items-center gap-2 rounded-md border border-success/20 bg-success/10 p-3 text-success">
                <CheckCircle2 className="size-5" />
                <span className="text-sm font-medium">
                  Trích xuất thành công! Vui lòng kiểm tra lại.
                </span>
              </div>
            ) : (
              <div className="bg-muted/30 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-full">
                  {scan === "scanning" ? (
                    <Spinner className="size-6" />
                  ) : (
                    <ScanLine className="size-6" />
                  )}
                </div>
                <h3 className="mb-1 font-semibold">
                  Tải lên ảnh CCCD mặt trước
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Hệ thống sẽ tự động điền các thông tin cơ bản.
                </p>
                <Button
                  type="button"
                  onClick={handleScan}
                  disabled={scan === "scanning"}
                >
                  <Upload />
                  {scan === "scanning" ? "Đang quét..." : "Quét CCCD"}
                </Button>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                control={form.control}
                name="fullName"
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
              />
              <TextField
                control={form.control}
                name="idCard"
                label="Số CCCD"
                placeholder="012345678912"
              />
              <TextField
                control={form.control}
                name="dob"
                label="Ngày sinh"
                type="date"
              />
              <TextField
                control={form.control}
                name="hometown"
                label="Quê quán"
                placeholder="Quận 1, TP. Hồ Chí Minh"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="text-primary size-5" />
              Thông tin liên lạc
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <TextField
              control={form.control}
              name="phone"
              label="Số điện thoại"
              placeholder="0905 xxx xxx"
            />
            <TextField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="email@example.com"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="text-primary size-5" />
              Phương tiện
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <TextField
              control={form.control}
              name="vehicleType"
              label="Loại xe"
              placeholder="VD: Honda Vision"
            />
            <TextField
              control={form.control}
              name="vehiclePlate"
              label="Biển số xe"
              placeholder="43-X1 123.45"
            />
          </CardContent>
        </Card>
      </form>

      <div className="flex justify-end gap-3">
        <Link
          to={ROUTES.TENANTS}
          className={buttonVariants({ variant: "outline" })}
        >
          Hủy bỏ
        </Link>
        <Button type="submit" form={FORM_ID} disabled={createTenant.isPending}>
          Lưu hồ sơ Người thuê
        </Button>
      </div>
    </div>
  );
}
