/**
 * A placeholder: the real sign-in screen (email/password, Zod validation, the
 * async session check) lands with the Session ticket. This skeleton only
 * needs GuestRoute to have somewhere to render.
 */
export default function SignInTemplate() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-foreground text-3xl font-semibold tracking-tight">
        Sign in
      </h1>
      <p className="text-muted-foreground max-w-sm text-center text-sm">
        Not built yet — lands with the Session ticket.
      </p>
    </div>
  );
}
