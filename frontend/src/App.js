// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import UserLoginPage from "./Pages/UserLoginPage";
import AdminLoginPage from "./Pages/AdminLoginPage";
import UserHome from "./Pages/UserHome";
import ReportPage from "./Pages/ReportPage";
import TrackPage from "./Pages/TrackPage";
import AdminPage from "./Pages/AdminPage";
import ShowReportsPage from "./Pages/ShowReportsPage";
import UpdateReportPage from "./Pages/UpdateReportPage";

// Private route wrapper
const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;

  if (role) {
    const storedRole = localStorage.getItem("role") || "";
    if (storedRole !== role) return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />

        {/* User routes */}
        <Route
          path="/user-home"
          element={
            <PrivateRoute role="user">
              <UserHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/report"
          element={
            <PrivateRoute role="user">
              <ReportPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/track"
          element={
            <PrivateRoute role="user">
              <TrackPage />
            </PrivateRoute>
          }
        />

        {/* New routes */}
        <Route
          path="/show-reports"
          element={
            <PrivateRoute role="user">
              <ShowReportsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/update-report/:reportId"
          element={
            <PrivateRoute role="user">
              <UpdateReportPage />
            </PrivateRoute>
          }
        />

        {/* Admin route */}
        <Route
          path="/admin-page"
          element={
            <PrivateRoute role="admin">
              <AdminPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
