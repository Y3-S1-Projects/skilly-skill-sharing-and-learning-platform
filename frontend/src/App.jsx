import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

//Components
import Header from "./Components/Header";
import GitHubCallback from "./Components/GithubCallback";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import SocialFeed from "./Pages/SocialFeed";
import UserProfile from "./Pages/UserProfile";
import Auth from "./Pages/Auth";
import Profile from "./Pages/Profile";
// import SearchResults from "./Components/SearchResults";
import SearchResults from "./Components/SearchResults ";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/socialfeed" element={<SocialFeed />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<SearchResults />} />

        {/*Components */}
        <Route path="/header" element={<Header />} />
      </Routes>
    </Router>
  );
}

export default App;
