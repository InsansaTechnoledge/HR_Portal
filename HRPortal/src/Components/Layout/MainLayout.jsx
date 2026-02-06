import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Login/Sidebar";
import { useContext } from "react";
import { userContext } from "../../Context/userContext";

const MainLayout = () => {
  const { user } = useContext(userContext);
  const location = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {user && <Sidebar />}
      <main className="flex-1 overflow-auto">
        <div
          key={location.pathname}
          className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full"
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
