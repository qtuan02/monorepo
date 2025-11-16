import type { FC, ReactNode } from "react";

interface ICardExperienceProps {
  position: string;
  company: string;
  date: string;
  description: ReactNode;
}

const CardExperience: FC<ICardExperienceProps> = (props) => {
  const { position, company, date, description } = props;

  return (
    <div className="flex flex-col gap-y-2 border-l-4 border-orange-500 pl-4">
      <div className="flex flex-col gap-y-1">
        <h3 className="text-lg font-semibold md:text-xl">{position}</h3>
        <p className="text-base font-medium text-orange-500 md:text-lg">
          {company}
        </p>
        <p className="text-sm text-gray-600 md:text-base">{date}</p>
        <p className="text-sm text-gray-600 md:text-base">{description}</p>
      </div>
    </div>
  );
};

export default CardExperience;
