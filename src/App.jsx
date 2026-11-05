import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Workspace from "./pages/Workspace";
import About from "./pages/About";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCipherId, setSelectedCipherId] = useState("caesar");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Automatically scroll to top whenever navigation tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const isAboutActive =
    activeTab === "about" ||
    activeTab === "about-ciphers" ||
    activeTab === "about-classical-ciphers";

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCipherId={selectedCipherId}
        onSelectCipher={setSelectedCipherId}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onNavigate={setActiveTab}
          activeTab={activeTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary key={activeTab} onReset={() => setActiveTab('home')}>
            {activeTab === "home" && (
              <Home
                onNavigateToWorkspace={() => setActiveTab("workspace")}
                onNavigateToAbout={() => setActiveTab("about")}
                onSelectCipher={(cipherId) => {
                  setSelectedCipherId(cipherId);
                  setActiveTab("workspace");
                }}
              />
            )}

            {activeTab === "workspace" && (
              <Workspace
                selectedCipherId={selectedCipherId}
                setSelectedCipherId={setSelectedCipherId}
              />
            )}

            {isAboutActive && <About />}
          </ErrorBoundary>
        </main>

        {/* Minimal Academic Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <p>
            Classical Cipher Studio &bull; Computer Network &amp; Security
            Academic Project &bull; Interactive Cryptography Lab
          </p>
        </footer>
      </div>
    </div>
  );
}
