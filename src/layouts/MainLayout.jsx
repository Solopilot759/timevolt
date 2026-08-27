import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;