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
      {/* pb-14 on mobile reserves space above the fixed BottomNav (56px = 3.5rem = 14 × 4px) */}
      <main className="flex-1 pb-14 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default PageWrapper;
