import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

const PageWrapper = () => {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <Navbar />
      <main className="flex-1 mobile-page-content">
        <Outlet />
      </main>
      <div className="hidden md:block"><Footer /></div>
      <div className="md:hidden"><Footer mobile /></div>
      <BottomNav />
    </div>
  );
};

export default PageWrapper;
