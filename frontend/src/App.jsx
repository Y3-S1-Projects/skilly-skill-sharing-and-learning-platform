// frontend/src/App.jsx
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

//Components
import Header from "./Components/Header";
import GitHubCallback from "./Components/GithubCallback";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import SocialFeed from "./Pages/SocialFeed";
import UserProfile from "./Pages/UserProfile";
import PublicProfile from "./Pages/PublicProfile";
import Auth from "./Pages/Auth";
import NotificationSystem from "./Components/NotificationSystem";
import Profile from "./Pages/Profile";
import SearchResults from "./Components/SearchResults ";

// Learning Plans Components
import LearningPlans from "./Pages/LearningPlans";
import LearningPlanDetail from "./Pages/LearningPlanDetail";
import CreateLearningPlan from "./Pages/CreateLearningPlan";
import EditLearningPlan from "./Pages/EditLearningPlan";

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
        <Route path="/profile/:userId" element={<PublicProfile />} />
        <Route path="/notification" element={<NotificationSystem />} />
        <Route path="/search" element={<SearchResults />} />

        {/* Learning Plans Routes */}
        <Route path="/learning-plans" element={<LearningPlans />} />
        <Route path="/learning-plans/:id" element={<LearningPlanDetail />} />
        <Route path="/learning-plans/create" element={<CreateLearningPlan />} />
        <Route path="/learning-plans/edit/:id" element={<EditLearningPlan />} />

        {/*Components */}
        <Route path="/header" element={<Header />} />
      </Routes>
    </Router>
  );
}

export default App;
