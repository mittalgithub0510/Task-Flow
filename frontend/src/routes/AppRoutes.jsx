import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleBasedRoute from '../components/RoleBasedRoute';

import Projects from '../pages/Projects';
import CreateProject from '../pages/CreateProject';
import Tasks from '../pages/Tasks';
import CreateTask from '../pages/CreateTask';
import Team from '../pages/Team';
import AdminDashboard from '../pages/AdminDashboard';
import MemberDashboard from '../pages/MemberDashboard';
import Announcements from '../pages/Announcements';
import Unauthorized from '../pages/Unauthorized';
import Notifications from '../pages/Notifications';
import LeaveRequests from '../pages/LeaveRequests';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<RoleBasedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/leave-requests" element={<LeaveRequests />} />
            <Route path="/team" element={<Team />} />
            <Route path="/projects/create" element={<CreateProject />} />
            <Route path="/tasks/create" element={<CreateTask />} />
          </Route>
          
          <Route element={<RoleBasedRoute allowedRoles={['Member']} />}>
            <Route path="/member/dashboard" element={<MemberDashboard />} />
          </Route>
          
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
