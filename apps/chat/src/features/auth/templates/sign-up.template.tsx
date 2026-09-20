import { BrandMark } from "~/components/brand/brand-mark";
import { Island } from "~/components/island/island";
import SignUpForm from "~/features/auth/components/sign-up-form";

export default function SignUpTemplate() {
  return (
    <main className="grid min-h-dvh place-items-center p-2 md:p-3">
      <Island className="flex w-full max-w-sm flex-col items-center gap-3 px-6 py-7 md:px-8">
        <BrandMark />
        <SignUpForm />
      </Island>
    </main>
  );
}
