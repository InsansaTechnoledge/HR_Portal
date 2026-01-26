import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import { userContext } from "./Context/userContext";

/* Guards */
import ProtectedRoute from "./Route/ProtectedRoute";
import AdminRoute from "./Route/AdminRoute";
import NoSuperAdminRoute from "./Route/NoSuperAdminRoute";
import AccountantSuperAdminRoute from "./Route/AccountantSuperAdminRoute";

/* Layout */
import MainLayout from "./Components/Layout/MainLayout";
import Loader from "./Components/Loader/Loader";

/* Pages */
import Login from "./Components/Login/Login";
import Home from "./Page/Home";
import DocumentManagement from "./Page/DocumentManagement";
import LeaveTracker from "./Page/LeaveTracker";
import UserProfile from "./Page/UserProfile";
import ChangePassword from "./Components/Form/ChangePassword";
import PayslipTracker from "./Page/PayslipTracker";
import JobPostForm from "./Components/Form/JobPostForm";
import AddEmployeePage from "./Page/AddEmployee";
import CandidateDetails from "./Components/CandidateRegistrationForm/CandidateDetail";
import JobApplication from "./Page/JobApplication";
import CandidateRegistration from "./Page/CandidateRegistration";
import AuthenticationManagement from "./Page/AuthenticationManagement";
import EmployeeDetailsForm from "./Components/Form/EmployeeDetailsForm";
import EmployeeManagementForm from "./Page/PayslipInformation";
import EmployeeList from "./Page/InformationDisplay";
import PayslipGenerator from "./Page/PaySlip";
import ExpenseGenerator from './Page/ExpenseGernerator';
import ExpenseTracker from './Page/ExpenseTracker';
import AddExpense from './Page/AddExpense';
import ResumeAnalyzer from "./Page/ResumeAnalyzer";
import AnalysisResult from "./Page/AnalysisResult";
import TaskManagement from "./Page/TaskManagement";
import MyTasks from "./Page/MyTasks";

function PageLinks() {
  const { user, loading } = useContext(userContext);

  /* Prevent tree unmount flicker */
  // if (loading) return <Loader />;

  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/"
        element={user ? <Navigate to="/home" replace /> : <Login />}
      />

      {/* PROTECTED APP */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* COMMON */}
          <Route path="/home" element={<Home />} />
          <Route path="/docs" element={<DocumentManagement />} />
          <Route path="/leave-tracker" element={<LeaveTracker />} />
          <Route path="/payslip-tracker" element={<PayslipTracker />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/expense-tracker" element={<ExpenseTracker />} />
          <Route path="/my-tasks" element={<MyTasks />} />



          {/* ADMIN */}
          <Route element={<AdminRoute />}>
            <Route path="/post-job" element={<JobPostForm />} />
            <Route path="/add-employee" element={<AddEmployeePage />} />
            <Route path="/candidate-detail" element={<CandidateDetails />} />
            <Route path="/application" element={<JobApplication />} />
            <Route path="/register-candidate" element={<CandidateRegistration />} />
            <Route path="/emp-info-register" element={<EmployeeDetailsForm />} />
            <Route path="/auth" element={<AuthenticationManagement />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/analysis-result" element={<AnalysisResult />} />
            <Route path="/task-management" element={<TaskManagement />} />
          </Route>

          {/* ROLE BASED */}
          <Route element={<NoSuperAdminRoute />}>
            <Route path="/emp-info" element={<EmployeeManagementForm />} />
          </Route>

          <Route element={<AccountantSuperAdminRoute />}>
            <Route path="/emp-list" element={<EmployeeList />} />
            <Route path="/payslip" element={<PayslipGenerator />} />
            <Route path="/expense" element={<ExpenseGenerator />} />
          </Route>
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default PageLinks;
