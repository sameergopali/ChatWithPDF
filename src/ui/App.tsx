import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './Landingpage';
import type { RecentFile } from './Landingpage';
import PDFViewer from './PdfViewer';



const App = () => {

  // You may want to fetch or define recentFiles elsewhere
  const recentFiles: RecentFile[] = [
    {
      id: '1',
      name: 'Document 1',
      lastOpened: '2023-10-01',
      pages: 10,
    },
    {
      id: '2',
      name: 'Document 2',
      lastOpened: '2023-10-02',
      pages: 5,
    },
    {
      id: '3',
      name: 'Document 3',
      lastOpened: '2023-10-03',
      pages: 8,
    },
  ];

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage recentFiles={[]} />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/viewer" element={<PDFViewer />} />
      </Routes>
    </BrowserRouter>
  );
};


export default App;