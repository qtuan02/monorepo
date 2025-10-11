import { Separator } from "@web/web-ui/shadcn-ui/separator";
import { BaseCard } from "~/features/menu/components/card/base-card";

interface IListItemProps {}

const ListItem: React.FC<IListItemProps> = (props) => {
  const {} = props;

  return (
    <div className="flex flex-col">
      <div>
        <h3 className="text-lg font-medium py-2">Category 1</h3>
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="w-full flex flex-col justify-center">
              <BaseCard
                imageSrc="https://th.bing.com/th/id/OIP.7nAAGu-DUyyMBY8hq-6tVwHaE7?w=263&h=180&c=7&r=0&o=7&cb=12&pid=1.7&rm=3"
                name="Cà phê sữa"
                price={100000}
              />
              <Separator className="my-3" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium py-2">Category 1</h3>
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="w-full flex flex-col justify-center">
              <BaseCard
                imageSrc="https://th.bing.com/th/id/OIP.7nAAGu-DUyyMBY8hq-6tVwHaE7?w=263&h=180&c=7&r=0&o=7&cb=12&pid=1.7&rm=3"
                name="Cà phê sữa"
                price={100000}
              />
              <Separator className="my-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ListItem };
