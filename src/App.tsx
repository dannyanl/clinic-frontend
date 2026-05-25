import { Navigate, Route, Routes } from "react-router-dom";

import Landing from "./pages/Public/Landing";
import LegalPage from "./pages/Public/LegalPage";
import SurveyForm from "./pages/Public/SurveyForm";
import VerifyPrescription from "./pages/Public/VerifyPrescription";

import AppLayout from "./components/layout/AppLayout";
import RequireAuth from "./components/layout/RequireAuth";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

import Dashboard from "./pages/Dashboard/Dashboard";
import AppointmentBooking from "./pages/Appointments/AppointmentBooking";
import MyAppointments from "./pages/Appointments/MyAppointments";
import DoctorsList from "./pages/Doctors/DoctorsList";
import DoctorProfile from "./pages/Doctors/DoctorProfile";
import MySchedulePage from "./pages/Doctors/MySchedulePage";
import PatientsList from "./pages/Patients/PatientsList";
import PatientDetail from "./pages/Patients/PatientDetail";
import MedicalRecords from "./pages/MedicalRecords";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports/Reports";
import AdminPanel from "./pages/Admin/AdminPanel";
import PHILogsViewer from "./pages/Admin/PHILogsViewer";
import SuperAdminPanel from "./pages/SuperAdmin/SuperAdminPanel";
import RolesPage from "./pages/Roles/RolesPage";
import Calendar from "./pages/Calendar";
import WaitingRoom from "./pages/WaitingRoom";
import SearchPage from "./pages/Search";
import Inventory from "./pages/Inventory";
import Insurance from "./pages/Insurance";
import Profile from "./pages/Profile";
import ConsentsPage from "./pages/Consents/ConsentsPage";

import TwoFactorSetup from "./pages/Account/TwoFactorSetup";
import PolicyAcceptance from "./pages/Account/PolicyAcceptance";
import DataExportRequest from "./pages/Account/DataExportRequest";

import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/legal/:kind" element={<LegalPage />} />
      <Route path="/survey/:token" element={<SurveyForm />} />
      <Route path="/verify-prescription" element={<VerifyPrescription />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Turnos */}
          <Route path="/appointments" element={<MyAppointments />} />
          <Route path="/appointments/new" element={<AppointmentBooking />} />

          {/* Calendario */}
          <Route path="/calendar" element={<Calendar />} />

          {/* Sala de espera */}
          <Route path="/waiting-room" element={<WaitingRoom />} />

          {/* Doctores */}
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/doctors/:id" element={<DoctorProfile />} />

          {/* Mi agenda (doctores) */}
          <Route path="/my-schedule" element={<MySchedulePage />} />

          {/* Pacientes */}
          <Route path="/patients" element={<PatientsList />} />
          <Route path="/patients/:id" element={<PatientDetail />} />

          {/* Clínica */}
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/inventory" element={<Inventory />} />

          {/* Consentimientos */}
          <Route path="/consents" element={<ConsentsPage />} />

          {/* Reportes y admin */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/phi-logs" element={<PHILogsViewer />} />

          {/* Super Admin */}
          <Route path="/superadmin" element={<SuperAdminPanel />} />

          {/* Roles */}
          <Route path="/roles" element={<RolesPage />} />

          {/* Búsqueda */}
          <Route path="/search" element={<SearchPage />} />

          {/* Mi cuenta */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/account/2fa" element={<TwoFactorSetup />} />
          <Route path="/account/policies" element={<PolicyAcceptance />} />
          <Route path="/account/data" element={<DataExportRequest />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
