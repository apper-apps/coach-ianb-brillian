import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import AskPage from "@/components/pages/AskPage";
import SearchPage from "@/components/pages/SearchPage";
import SourcesPage from "@/components/pages/SourcesPage";
import UploadsPage from "@/components/pages/UploadsPage";
import CollectionsPage from "@/components/pages/CollectionsPage";
import AnalyticsPage from "@/components/pages/AnalyticsPage";
import AdminPage from "@/components/pages/AdminPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<AskPage />} />
            <Route path="ask" element={<AskPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="sources" element={<SourcesPage />} />
            <Route path="uploads" element={<UploadsPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-[9999]"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;