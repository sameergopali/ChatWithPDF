import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

// Define the RecentFile type
export type RecentFile = {
    id: string;
    name: string;
    lastOpened: string;
    pages: number;
};

interface LandingPageProps {
  recentFiles: RecentFile[];
}

const LandingPage: React.FC<LandingPageProps> = () => {
  const navigate = useNavigate();
 

  const handleFileClick = async () => {
    const filePath = await window.electronAPI.openPDFDialog();
    if (filePath !== null) {
      navigate('/viewer', { state: { filePath  } });
    } else {
      alert("No file selected");
    }
  };

  

  return (
    <div className="bg-gradient-to-br text-white w-full flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-4">Welcome to AI PDF Reader</h1>
      <p className="text-xl mb-8 text-center max-w-xl">
        Highlight text in your PDFs to get instant AI-powered explanations and start chat sessions about the content.
      </p>

      <div className="flex gap-6 flex-wrap justify-center">
        <button
          className="bg-gray-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg transition"
          onClick={handleFileClick}
        >
          📄 Open PDF
        </button>
   
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg transition"
          onClick={()=> console.log("Open settings")}
        >
          🚀 Settings
        </button>
      </div>

    


      <footer className="mt-16 text-sm text-gray-400">
        PDF Chat | v1.0.1
      </footer>
    </div>
  );
};

export default LandingPage;
