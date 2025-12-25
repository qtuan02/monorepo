import { Route, Routes } from "react-router";

import AllComponentsPage from "./pages/all-components-page";
import AllHooksPage from "./pages/all-hooks-page";
import ComponentDetailPage from "./pages/component-detail-page";
import HomePage from "./pages/home-page";
import HookDetailPage from "./pages/hook-detail-page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/components" element={<AllComponentsPage />} />
      <Route path="/components/:id" element={<ComponentDetailPage />} />
      <Route path="/hooks" element={<AllHooksPage />} />
      <Route path="/hooks/:id" element={<HookDetailPage />} />
    </Routes>
  );
}
