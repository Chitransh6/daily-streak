import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import DailyStreakPage from './pages/DailyStreak/DailyStreakPage.jsx';
const Guard = ({ children }) => (localStorage.getItem('token') ? children : <Navigate to="/login" replace />);
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/daily-streak" element={<Guard><DailyStreakPage /></Guard>} />
      <Route path="*" element={<Navigate to="/daily-streak" replace />} />
    </Routes>
  );
}
