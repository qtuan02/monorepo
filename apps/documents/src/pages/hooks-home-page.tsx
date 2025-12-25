import { Navigate } from "react-router";

export default function HooksHomePage() {
  // Redirect to default category (Client-side)
  return <Navigate to="/hooks/client-side" replace />;
}

