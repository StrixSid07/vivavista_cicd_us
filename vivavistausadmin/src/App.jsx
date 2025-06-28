import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import PrivateRoute from "@/security/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="/auth/*" element={<Auth />} />
      <Route
        path="*"
        element={
          <PrivateRoute>
            <Navigate to="/dashboard/manage-booking" replace />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
