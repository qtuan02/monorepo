import { Navigate } from "react-router";

export default function HomePage() {
  // Redirect to components page
  return <Navigate to="/components" replace />;
}
