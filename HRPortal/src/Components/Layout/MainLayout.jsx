import { Outlet } from "react-router-dom";
import Sidebar from "../Login/Sidebar";
import { useContext } from "react";
import { userContext } from "../../Context/userContext";

const MainLayout = () => {
  const { user } = useContext(userContext);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {user && <Sidebar />}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
