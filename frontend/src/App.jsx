import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import LearningPlan from "./Pages/LearningPlan";
import LearningPlanCreator from "./Components/LearningPlanCreator2";
import SearchResults from "./Components/SearchResults ";
import PostCard from "./Components/PostCard";
import EditProfilePage from "./Pages/EditProfilePage";
import LearningPlans from "./Pages/LearningPlans";
import LearningPlanDetail from "./Pages/LearningPlanDetail";
import CreateLearningPlan from "./Pages/CreateLearningPlan";
import EditLearningPlan from "./Pages/EditLearningPlan";
import ProtectedRoute from "./guards/authGuard";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/socialfeed"
          element={
            <ProtectedRoute>
              <SocialFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userprofile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile/:userId" element={<PublicProfile />} />
        <Route path="/notification" element={<NotificationSystem />} />
        <Route path="/learning-plan" element={<LearningPlan />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/postcard" element={<PostCard />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/learning-plans" element={<LearningPlans />} />
        <Route path="/learning-plans/:id" element={<LearningPlanDetail />} />
        <Route path="/learning-plans/create" element={<CreateLearningPlan />} />
        <Route path="/learning-plans/edit/:id" element={<EditLearningPlan />} />
        <Route
          path="/learning-plan-creator"
          element={<LearningPlanCreator />}
        />
        {/*Components */}
        <Route path="/header" element={<Header />} />
      </Routes>
    </Router>
  );
}

export default App;
