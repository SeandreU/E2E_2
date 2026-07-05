import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DriverTripDetailPage from "./pages/DriverTripDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/passenger" element={<h1>Dashboard pasajero</h1>} />

        <Route path="/driver" element={<h1>Dashboard conductor</h1>} />

        <Route path="/driver/trips/:id" element={<DriverTripDetailPage />} />

        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;