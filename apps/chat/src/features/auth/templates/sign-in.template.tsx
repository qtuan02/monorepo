import SignInForm from "~/features/auth/components/sign-in-form";

export default function SignInTemplate() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <SignInForm />
    </div>
  );
}
