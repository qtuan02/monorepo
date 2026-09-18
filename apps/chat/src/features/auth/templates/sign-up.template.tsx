import SignUpForm from "~/features/auth/components/sign-up-form";

export default function SignUpTemplate() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <SignUpForm />
    </div>
  );
}
