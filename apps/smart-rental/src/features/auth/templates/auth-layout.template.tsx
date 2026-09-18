import { Outlet } from "react-router";

/**
 * The chromeless frame around the guest screens — the prototype's `AuthLayout`,
 * mounted as the element of the `GuestRoute` group in `~/pages/main.tsx`. The
 * brand line is a `<p>`, not an `<h1>`: each screen inside owns the one heading.
 */
export default function AuthLayoutTemplate() {
  return (
    <div className="bg-muted/40 flex min-h-svh flex-col items-center justify-center">
      <div className="w-full max-w-md p-4">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-primary text-primary-foreground mb-4 flex size-12 items-center justify-center rounded-xl shadow-sm">
            <span className="text-xl font-bold">PT</span>
          </div>
          <p className="text-2xl font-bold tracking-tight">Phòng Trọ Pro</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Giải pháp quản lý phòng trọ toàn diện
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
