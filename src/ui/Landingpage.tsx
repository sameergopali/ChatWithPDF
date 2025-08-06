import React from "react";
import { useNavigate } from 'react-router-dom';

// Define the RecentFile t
export type RecentFile = {
    id: string;
    name: string;
    lastOpened: string;
    pages: number;
};

interface LandingPageProps {
  recentFiles: RecentFile[];
}

const LandingPage: React.FC<LandingPageProps> = ({ recentFiles }) => {
  const navigate = useNavigate();
  const handleFileClick = async () => {
    const filePath = await window.electronAPI.openPDFDialog();
    if (filePath) {
      navigate('/viewer', { state: { filePath: filePath } });
    } else {
      alert("No file selected");
    }
  };

  return (
    <div className=" bg-gradient-to-br text-white w-full flex flex-col items-center justify-center p-8">
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
          className="bg-gray-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg transition"
          onClick={() => alert("Settings")}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Recent Files Section */}
      <div className="w-full max-w-4xl justify-left mt-12 ">
        <h2 className="text-2xl font-semibold mb-6 text-center">Recent Documents</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {recentFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={handleFileClick}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-white truncate">
                    {file.name}
                  </h3>
                  <div className="text-sm text-gray-300 mb-1">
                    Last opened: {file.lastOpened}
                  </div>
                  <div className="text-sm text-gray-300">
                    Pages: {file.pages}
                  </div>
                </div>
                <div className="ml-4 text-2xl">📄</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <footer className="mt-16 text-sm text-gray-400">
        PDF Chat | v1.0.1
      </footer>
    </div>
  );
};

export default LandingPage;
