import { pdfjs } from 'react-pdf';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './Landingpage';
import MainApp from './MainApp';

const App = () => {


  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
  ).toString();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage recentFiles={[]} />} />
        <Route path="/viewer" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
};


export default App;