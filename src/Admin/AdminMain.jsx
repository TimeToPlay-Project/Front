import React, { useState } from "react";
import "../css/Main.css";
import AdminNavigate from "./AdminNavigate";
import QuizComponent from "./Component/QuizComponent";
import TestComponent from "./Component/TestComponent";
import TournamentComponent from "./Component/TournamentComponent";



function AdminMain() {
  const [activeComponent, setActiveComponent] = useState('main'); 

  const renderComponent = () => {
    switch (activeComponent) {
      case 'quiz':
        return <QuizComponent />;
      case 'tournament':
        return <TournamentComponent />;
      case 'test':
        return <TestComponent />;
    //   case 'M':
    //     return <MComponent />;
      default:
        return <div>관리자 페이지 입니다1.</div>;  
    }
  };

  return (
    <div>
      <div className="Navigate-Box">
        <AdminNavigate setActiveComponent={setActiveComponent} />
      </div>
      <div className="Main-Box" style={{ display: 'flex', justifyContent: 'center',  height: '100vh' }}>
        {renderComponent()}
      </div>
    </div>
  );
}

export default AdminMain;
