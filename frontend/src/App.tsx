import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Events from "./pages/Events";
import Signups from "./pages/Signups";
import MyEvents from "./pages/MyEvents";
import Settings from "./pages/Settings";
import EventDetails from "./pages/EventDetails";
import ProfileEdit from "./pages/ProfileEdit";
import Login from "./pages/Login";
import EditEvent from "./pages/EditEvent";
import CreateEvent from "./pages/CreateEvent";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<GoogleAuthCallback />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Home />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute>
                <Layout>
                  <Events />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/signups"
            element={
              <PrivateRoute>
                <Layout>
                  <Signups />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/my-events"
            element={
              <PrivateRoute>
                <Layout>
                  <MyEvents />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/events/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <EventDetails />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/events/edit/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <EditEvent />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/events/create"
            element={
              <PrivateRoute>
                <Layout>
                  <CreateEvent />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/profile/edit"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfileEdit />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
