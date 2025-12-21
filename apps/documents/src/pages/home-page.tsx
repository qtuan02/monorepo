import { Navigate } from "react-router";

export default function HomePage() {
  // Redirect to default category (Form) or show all components
  return <Navigate to="/components/form" replace />;
}

