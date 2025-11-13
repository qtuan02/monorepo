import { FC } from "react";

interface IBadgeSkillProps {
  name: string;
}

const BadgeSkill: FC<IBadgeSkillProps> = (props) => {
  const { name } = props;

  return (
    <div className="flex cursor-pointer items-center rounded-2xl bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-500 transition-all duration-300 select-none hover:scale-105 hover:bg-orange-200 md:px-3 md:text-sm">
      <span>{name}</span>
    </div>
  );
};

export default BadgeSkill;
