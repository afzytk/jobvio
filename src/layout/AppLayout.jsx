import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { Footer } from "../components/Footer";

const AppLayout = () => {
  return (
    <div>
      <div className="grid-background"></div>
      <main className="min-h-screen container mx-auto px-4 sm:px-8">
        <Header />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
