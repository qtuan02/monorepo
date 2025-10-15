import { NextImage } from "~/components/next-image";
import NextLink from "~/components/next-link";
import Language from "../components/navbar/language";
import Menu from "../components/navbar/menu";
import Theme from "../components/navbar/theme";

export default function Navbar() {
  return (
    <nav className="fixed z-50 w-full select-none bg-white/30 shadow-sm backdrop-blur-md dark:bg-gray-900/30">
      <div className="md:h-15 flex-center flex h-12 items-center justify-between px-3">
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

          <div className="hidden items-center gap-x-1 md:flex">
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
