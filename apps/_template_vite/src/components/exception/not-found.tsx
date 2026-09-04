import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "~/constants/routes";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-sm max-md:px-4">
      <h1 className="bg-linear-to-r from-gray-500 to-gray-800 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
        {t("notFound.title")}
      </h1>
      <div className="my-5 h-px w-80 rounded bg-linear-to-r from-gray-400 to-gray-800 md:my-7"></div>
      <p className="max-w-lg text-center text-gray-400 md:text-xl">
        {t("notFound.message")}
      </p>
      <Link
        to={ROUTES.HOME}
        className="group mt-10 flex items-center gap-1 rounded-full bg-white px-7 py-2.5 font-medium text-gray-800 transition-all hover:bg-gray-200 active:scale-95"
      >
        {t("notFound.backToHome")}
        <svg
          aria-hidden="true"
          className="transition group-hover:translate-x-0.5"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.583 11h12.833m0 0L11 4.584M17.416 11 11 17.417"
            stroke="#1E1E1E"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}
