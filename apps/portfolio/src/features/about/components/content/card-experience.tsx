import { FC, ReactNode } from "react";

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
        <h3 className="text-xl font-semibold">{position}</h3>
        <p className="text-lg text-orange-500 font-medium">{company}</p>
        <p className="text-gray-600">{date}</p>
        <p className="text-gray-600 ">{description}</p>
      </div>
    </div>
  );
};

export default CardExperience;
