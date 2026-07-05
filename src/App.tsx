import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DriverTripDetailPage from "./pages/DriverTripDetailPage";
import PassengerDashboard from "./pages/PassengerDashboard";
import DriverDashboard from "./pages/DriverDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/passenger" element={<PassengerDashboard />} />

        <Route path="/driver" element={<DriverDashboard />} />

        <Route path="/driver/trips/:id" element={<DriverTripDetailPage />} />

        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;