import type { ComplianceItem } from "~/types/compliance";

/** The Mock every Khai báo lưu trú read comes from (spec #127). */
export const mockComplianceItems: ComplianceItem[] = [
  {
    id: "C001",
    tenant: "Nguyễn Văn An",
    room: "Phòng 101",
    type: "residence_declaration",
    status: "completed",
    dueDate: "15/03/2026",
    completedDate: "10/03/2026",
  },
  {
    id: "C002",
    tenant: "Trần Thị Bình",
    room: "Phòng 102",
    type: "residence_declaration",
    status: "pending",
    dueDate: "20/04/2026",
  },
  {
    id: "C003",
    tenant: "Lê Văn Chiến",
    room: "Phòng 103",
    type: "safety_inspection",
    status: "overdue",
    dueDate: "01/04/2026",
  },
  {
    id: "C004",
    tenant: "Phạm Thị Duyên",
    room: "Phòng 104",
    type: "documentation",
    status: "pending",
    dueDate: "30/04/2026",
  },
];
