import * as z from "zod";

/** The four things a landlord ticks off before a Thanh lý can proceed. */
export const liquidationChecklist = [
  {
    id: "assetCheck",
    title: "Kiểm tra tài sản",
    description: "Kiểm tra điều kiện phòng, nội thất và trang thiết bị",
  },
  {
    id: "settleUtilities",
    title: "Thanh toán tiện ích",
    description: "Thanh toán hóa đơn điện nước còn nợ",
  },
  {
    id: "collectKeys",
    title: "Tập hợp chìa khóa",
    description: "Thu hồi chìa khóa phòng từ khách",
  },
  {
    id: "finalInspection",
    title: "Kiểm tra cuối cùng",
    description: "Xác nhận trạng thái phòng với khách",
  },
] as const;

export type LiquidationChecklistId =
  (typeof liquidationChecklist)[number]["id"];

const CHECKLIST_ERROR = "Hoàn thành toàn bộ danh sách kiểm tra";

// A box that must be ticked: `false` fails, as `z.literal(true)` would make it —
// but through `refine`, so the form's input type stays `boolean` and an unticked
// default is not a type error.
const ticked = z.boolean().refine((value) => value, { error: CHECKLIST_ERROR });

export const liquidationFormSchema = z.object({
  assetCheck: ticked,
  settleUtilities: ticked,
  collectKeys: ticked,
  finalInspection: ticked,
} satisfies Record<LiquidationChecklistId, typeof ticked>);

export type LiquidationFormInput = z.input<typeof liquidationFormSchema>;
export type LiquidationFormValues = z.output<typeof liquidationFormSchema>;
