import { NextImage } from "~/components/next-image";
import NextLink from "~/components/next-link";

import Language from "../components/navbar/language";
import Theme from "../components/navbar/theme";
import Menu from "../components/navbar/menu";

export default function Navbar() {
  return (
    <nav className="fixed z-50 w-full shadow-sm bg-white/30 dark:bg-gray-900/30 backdrop-blur-md select-none">
      <div className="flex items-center h-12 md:h-15 px-3 justify-between flex-center">
        <section className="flex items-center gap-x-10">
          <NextLink href="/" className="flex items-center gap-x-2 md:px-2">
            <NextImage
              src="/logo.webp"
              alt="logo"
              width={32}
              height={32}
              priority
            />
            <span className="text-xl font-bold">Portfolio</span>
          </NextLink>

          <div className="hidden md:flex items-center gap-x-1">
            <Menu />
          </div>
        </section>

        <section className="flex items-center gap-x-1">
          <Theme />
          <Language />
        </section>
      </div>
    </nav>
  );
}
