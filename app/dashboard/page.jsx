import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import WelcomeBanner from "./_components/WelcomeBanner";
import StreakWidget from "./_components/StreakWidget";

const Dashboard = () => {
  return (
    <div className="py-6 sm:py-8 space-y-8">
      <WelcomeBanner />

      <StreakWidget variant="dashboard" />

      <div>
        <AddNewInterview />
      </div>

      <div className="pt-2">
        <InterviewList />
      </div>
    </div>
  );
};

export default Dashboard;
