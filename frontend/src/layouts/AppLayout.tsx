import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { ToastContainer } from '../components/ToastContainer';
import './AppLayout.css';

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-layout__content">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
