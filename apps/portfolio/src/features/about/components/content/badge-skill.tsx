import { FC } from "react";

interface IBadgeSkillProps {
  name: string;
}

const BadgeSkill: FC<IBadgeSkillProps> = (props) => {
  const { name } = props;

  return (
    <div className="flex select-none hover:scale-105 items-center px-2 md:px-3 text-xs md:text-sm py-0.5 rounded-2xl cursor-pointer bg-orange-100 hover:bg-orange-200 transition-all font-medium duration-300 text-orange-500">
      <span>{name}</span>
    </div>
  );
};

export default BadgeSkill;
