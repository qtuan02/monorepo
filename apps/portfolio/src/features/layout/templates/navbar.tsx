import { NextImage } from "~/components/next-image";
import NextLink from "~/components/next-link";

import Language from "../components/navbar/language";
import Theme from "../components/navbar/theme";
import Menu from "../components/navbar/menu";

export default async function Navbar() {
  return (
    <nav className="fixed z-50 w-full shadow-sm bg-white dark:bg-gray-900 select-none">
      <div className="flex items-center h-15 px-3 justify-between">
        <section className="flex items-center gap-x-10">
          <NextLink href="/" className="flex items-center gap-x-2">
            <NextImage
              src="/logo.webp"
              alt="logo"
              width={32}
              height={32}
              priority
            />
            <span className="text-lg font-bold">Portfolio</span>
          </NextLink>

          <Menu />
        </section>

        <section className="flex items-center gap-x-1">
          <Theme />
          <Language />
        </section>
      </div>
    </nav>
  );
}
