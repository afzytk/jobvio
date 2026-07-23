import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const AppLayout = () => {
  return (
    <div>
      <div className="grid-background"></div>
      <main className="min-h-screen container mx-auto px-4 sm:px-8">
        <Header />
        <Outlet />
      </main>
      <div className="p-6 text-center bg-gray-900 mt-10">Made with React</div>
    </div>
  );
};

export default AppLayout;
