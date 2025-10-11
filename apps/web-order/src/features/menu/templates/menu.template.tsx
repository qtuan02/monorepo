import LayoutTemplate from "~/features/layout/templates/layout.template";
import NavbarMenu from "../components/navbar-menu";
import PopularMenu from "../components/popular-menu";
import MainMenu from "../components/main-menu";

export default function MenuTemplate() {
  return (
    <LayoutTemplate navbar={<NavbarMenu />}>
      <section className="mt-18 space-y-3">
        <PopularMenu />
        <MainMenu />
      </section>
    </LayoutTemplate>
  );
}
