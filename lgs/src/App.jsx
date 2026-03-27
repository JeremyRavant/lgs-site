// src/App.jsx
import { Routes, Route } from 'react-router-dom';

import Navbar from '../layout/Navbar.jsx';   // <-- dossier layout est hors de src
import Footer from '../layout/Footer.jsx';

import Home from './pages/Home.jsx';
import Galerie from './pages/Galerie.jsx';
import Contact from './pages/Contact.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';        // <-- AJOUT
import RequireAuth from './pages/RequireAuth.jsx';

function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/galerie/:title" element={<Galerie />} />
          <Route path="/contact" element={<Contact />} />

          {/* page de login (publique) */}
          <Route path="/login" element={<Login />} />   {/* <-- AJOUT */}

          {/* /admin protégée par RequireAuth */}
          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
