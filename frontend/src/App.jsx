import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Components
import Header from "./Components/Header";
// import GitHubCallback from "./Components/GithubCallback";
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
import LoginSuccess from "./Components/LoginSuccess";
import PostView from "./Components/PostView";
import { Toaster } from "sonner";
import LandingPage from "./Pages/landing";
import CreatePostPage from "./Pages/CreatePostPage";
import Settings from "./Components/Settings";
import Explore from "./Pages/Explore";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* <Route path="/auth/github/callback" element={<GitHubCallback />} /> */}
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
          <Route path="/explore" element={<Explore />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route
            path="/userprofile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/notification" element={<NotificationSystem />} />
          <Route path="/learning-plan" element={<LearningPlan />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/postcard" element={<PostCard />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/learning-plans" element={<LearningPlans />} />
          <Route path="/learning-plans/:id" element={<LearningPlanDetail />} />
          <Route
            path="/learning-plans/create"
            element={<CreateLearningPlan />}
          />
          <Route
            path="/learning-plans/edit/:id"
            element={<EditLearningPlan />}
          />
          <Route
            path="/learning-plan-creator"
            element={<LearningPlanCreator />}
          />
          <Route path="/posts/:id" element={<PostView />} />
          {/*Components */}
          <Route path="/header" element={<Header />} />
        </Routes>
      </Router>
      <Toaster position="bottom-right" theme="dark" />
    </>
  );
}

export default App;
