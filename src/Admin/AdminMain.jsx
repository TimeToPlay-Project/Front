import React, { useState } from "react";
import "../css/Main.css";
import AdminNavigate from "./AdminNavigate";
import QuizComponent from "./Component/QuizComponent";
import TestComponent from "./Component/TestComponent";
import TournamentComponent from "./Component/TournamentComponent";

// import TournamentComponent from "./TournamentComponent";
// import TestComponent from "./TestComponent";
// import MComponent from "./MComponent";

function AdminMain() {
  const [activeComponent, setActiveComponent] = useState('main');  // 기본 화면을 메인으로 설정

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
        return <div>관리자 페이지 입니다1.</div>;  // 기본 화면
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
