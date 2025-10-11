import { CarouselCategory } from "./carousel-category";
import { ListItem } from "./list-item";

export default function MainMenu() {
  return (
    <div className="bg-white">
      <section className="h-10 sticky top-15 bg-white z-50 shadow-sm">
        <CarouselCategory />
      </section>
      <section className="px-3">
        <ListItem />
      </section>
    </div>
  );
}
