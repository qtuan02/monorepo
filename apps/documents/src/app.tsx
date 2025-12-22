import { Route, Routes } from "react-router";

import CategoryPage from "./pages/category-page";
import ComponentDetailPage from "./pages/component-detail-page";
import HomePage from "./pages/home-page";
import HookDetailPage from "./pages/hook-detail-page";
import HooksHomePage from "./pages/hooks-home-page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/components" element={<HomePage />} />
      <Route path="/components/:category" element={<CategoryPage />} />
      <Route
        path="/components/:category/:id"
        element={<ComponentDetailPage />}
      />
      <Route path="/hooks" element={<HooksHomePage />} />
      <Route path="/hooks/:id" element={<HookDetailPage />} />
      <Route path="/hooks/:category/:id" element={<HookDetailPage />} />
    </Routes>
  );
}
