import React, { useState, useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import ProtectedRoute from "./Route/ProtectedRoute";
import Login from "./Components/Login/Login";
import JobPostForm from "./Components/Form/JobPostForm";
import Home from "./Page/Home";
import CandidateRegistration from "./Page/CandidateRegistration";
import DocumentManagement from "./Page/DocumentManagement";
import Sidebar from "./Components/Login/Sidebar";
import MobileBar from "./Components/Login/MobileBar";
import JobApplication from "./Page/JobApplication";
import AuthenticationManagement from "./Page/AuthenticationManagement";
import LeaveTracker from "./Page/LeaveTracker";
import CandidateDetails from "./Components/CandidateRegistrationForm/CandidateDetail";
import { userContext } from "./Context/userContext";
import axios from "axios";
import API_BASE_URL from "./config";
import AddEmployeePage from "./Page/AddEmployee";
import SuperAdminRoute from "./Route/SuperAdminRoute";
import AdminRoute from "./Route/AdminRoute";
import PayslipGenerator from "./Page/PaySlip";
import EmployeeManagementForm from "./Page/PayslipInformation";
import EmployeeList from "./Page/InformationDisplay";
import NoSuperAdminRoute from "./Route/NoSuperAdminRoute";
import PayslipTracker from "./Page/PayslipTracker";
import AccountantSuperAdminRoute from "./Route/AccountantSuperAdminRoute";
import Loader from "./Components/Loader/Loader";
import UserProfile from "./Page/UserProfile";
import ChangePassword from "./Components/Form/ChangePassword";
import EmployeeDetailsForm from "./Components/Form/EmployeeDetailsForm";
import ResumeAnalyzer from "./Page/ResumeAnalyzer";
import AnalysisResult from "./Page/AnalysisResult";
import AddExpense from "./Page/AddExpense";
import ExpenseTracker from "./Page/ExpenseTracker";

function AppLayout() {
  // const location = useLocation();
  // const token = localStorage.getItem('token');
  const { user, loading } = useContext(userContext);

  // Determine if the user is on a mobile device
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const showSidebar = user && !isMobile;

  if (loading) {
    return <Loader />; // You can replace this with a proper loading spinner or component
  }

  return (
    <div className="flex h-screen">
      {showSidebar && <Sidebar />}
      {isMobile && user && <MobileBar />}
      <div
        className={`flex-1 p-4 overflow-auto ${
          showSidebar ? "" : "w-full mb-14"
        }`}
      >
        <Routes>
          {/* Common Routes */}
          <Route path="/" element={user ? <Home /> : <Login />} />
          <Route
            path="/docs"
            element={
              <ProtectedRoute>
                <DocumentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-tracker"
            element={
              <ProtectedRoute>
                <LeaveTracker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payslip-tracker"
            element={
              <ProtectedRoute>
                <PayslipTracker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-expense"
            element={
              <ProtectedRoute>
                <AddExpense />
              </ProtectedRoute>
            }
          />

          <Route
            path="/expense-tracker"
            element={
              <ProtectedRoute>
                <ExpenseTracker />
              </ProtectedRoute>
            }
          />

          {/* Admin-Only Routes */}

          <Route
            path="/post-job"
            element={
              <AdminRoute>
                <JobPostForm />
              </AdminRoute>
            }
          />
          <Route
            path="/add-employee"
            element={
              <AdminRoute>
                <AddEmployeePage />
              </AdminRoute>
            }
          />
          <Route
            path="/candidate-detail"
            element={
              <AdminRoute>
                <CandidateDetails />
              </AdminRoute>
            }
          />
          <Route
            path="/application"
            element={
              <AdminRoute>
                <JobApplication />
              </AdminRoute>
            }
          />
          <Route
            path="/register-candidate"
            element={
              <AdminRoute>
                <CandidateRegistration />
              </AdminRoute>
            }
          />
          <Route
            path="/emp-info-register"
            element={
              <AdminRoute>
                <EmployeeDetailsForm />
              </AdminRoute>
            }
          />

          <Route
            path="/auth"
            element={
              <AdminRoute>
                <AuthenticationManagement />
              </AdminRoute>
            }
          />

          <Route
            path="resume-analyze"
            element={
              <AdminRoute>
                <ResumeAnalyzer />
              </AdminRoute>
            }
          />

          <Route
            path="/analysis-result"
            element={
              <AdminRoute>
                <AnalysisResult />
              </AdminRoute>
            }
          />

          {/* No Super Admin route */}
          <Route
            path="/emp-info"
            element={
              <NoSuperAdminRoute>
                <EmployeeManagementForm />
              </NoSuperAdminRoute>
            }
          />

          {/* Super Admin route */}
          <Route
            path="/emp-list"
            element={
              <AccountantSuperAdminRoute>
                <EmployeeList />
              </AccountantSuperAdminRoute>
            }
          />

          {/* Accountant and Super admin */}
          <Route
            path="/payslip"
            element={
              <AccountantSuperAdminRoute>
                <PayslipGenerator />
              </AccountantSuperAdminRoute>
            }
          />

          {/* Any other route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function PageLinks() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default PageLinks;
