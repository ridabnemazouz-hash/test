import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { DashboardHome } from './pages/Dashboard/DashboardHome';
import { Admins } from './pages/Admins';
import { Students } from './pages/Students';
import { Teachers } from './pages/Teachers';
import { Parents } from './pages/Parents';
import { Classes } from './pages/Classes';
import { Subjects } from './pages/Subjects';
import { Transport } from './pages/Transport';
import { Payments } from './pages/Payments';
import { Register } from './pages/Register';
import { Accounts } from './pages/Accounts';
import { Chat } from './pages/Chat';
import { Grades } from './pages/Grades';
import { Planning } from './pages/Planning';
import { Attendance } from './pages/Attendance';
import { Content } from './pages/Content';
import { Settings } from './pages/Settings';
import { MyClasses } from './pages/MyClasses';
import { MyStudents } from './pages/MyStudents';

// Placeholder components for other routes
const Placeholder = ({ title }) => (
  <div className="h-full flex items-center justify-center">
    <h1 className="text-2xl font-semibold text-slate-400">{title} Component Placeholder</h1>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="admins" element={<Admins />} />
            
            {/* Admin Routes */}
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="parents" element={<Parents />} />
            <Route path="classes" element={<Classes />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="transport" element={<Transport />} />
            <Route path="accounts" element={<Accounts />} />

            {/* Teacher Routes */}
            <Route path="my-classes" element={<MyClasses />} />
            <Route path="my-students" element={<MyStudents />} />

            {/* Student Routes */}
            <Route path="planning" element={<Planning />} />

            {/* Shared Routes */}
            <Route path="grades" element={<Grades />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="content" element={<Content />} />
            <Route path="chat" element={<Chat />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
