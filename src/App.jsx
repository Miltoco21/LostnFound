
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from "./Pages/Home"
import IngresoPrendaPerdida from './Pages/IngresoPrendaPerdida';
import Navbar from './Componentes/Navbar';
import Footer from './Componentes/Footer'
function App() {
  

  return (
    <Router>
    <div className="App">
    <Navbar />
      {/* Opcional: Agrega un componente de navegación aquí */}
      <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/busqueda" element={<IngresoPrendaPerdida />} /> 
      </Routes>
      <Footer/>
    </div>
  </Router>

  )
}

export default App
