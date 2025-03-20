import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

//Components
import Header from "./Components/Header";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import SocialFeed from "./Pages/SocialFeed";
import UserProfile from "./Pages/UserProfile";
import Auth from "./Pages/Auth";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/socialfeed" element={<SocialFeed />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/auth" element={<Auth />} />
        {/*Components */}
        <Route path="/header" element={<Header />} />
      </Routes>
    </Router>
  );
}

export default App;
