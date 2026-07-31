export const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-800 bg-background/50 backdrop-blur-sm mt-20 py-6 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Job<span className="text-blue-500">vio</span>
        </h2>

        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Jobvio. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
