import { Routes, Route } from "react-router-dom";
import Home from "../src/components/page/Home";
import AboutUs from "../src/components/page/About/Aboutus";

export default function App() {
  return (<>
  
    <Routes>
      <Route path="/" element={<Home></Home>} />
      <Route path="about" element={<AboutUs />} />
    </Routes>
    </>
  );
}
