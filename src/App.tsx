import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ListPage } from "./pages/ListPage";
import { SyncPage } from "./pages/SyncPage";
import { CardPage } from "./pages/CardPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/list/:id" element={<ListPage />} />
        <Route path="/list/:id/sync" element={<SyncPage />} />
        <Route path="/card/:id" element={<CardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
