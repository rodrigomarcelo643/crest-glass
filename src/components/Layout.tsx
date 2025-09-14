import { Outlet } from "react-router-dom";
import MobileHeader from "./MobileHeader";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;