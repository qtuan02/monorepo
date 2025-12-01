import { SidebarInset } from "~/features/layout/components/sidebar";
import HeaderTemplate from "./header.template";
import { DashboardSidebar } from "./sidebar.template";

export default function LayoutTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardSidebar />
      <SidebarInset>
        <HeaderTemplate />
        <div className="mt-16">{children}</div>
      </SidebarInset>
    </>
  );
}
