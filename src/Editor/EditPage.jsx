import React, { useState } from "react";
import { useParams } from 'react-router-dom';
import "../css/Main.css";
import EditorNavigate from "./EditorNavigate";
import QuizEditPage from "./Component/QuizEditPage";
import TestEditPage from "./Component/TestEditPage";
import TournamentEditPage from "./Component/TournamentEditPage";



function EditorMain() {
  const { type, id } = useParams();

  const renderComponent = () => {
    switch (type) {
      case 'quiz':
        return <QuizEditPage />;
      case 'tournament':
        return <TournamentEditPage />;
      case 'test':
        return <TestEditPage />;
    //   case 'M':
    //     return <MComponent />;
      default:
        return <div>관리자 페이지 입니다1.</div>;  
    }
  };

  return (
    <div>
      <div className="Navigate-Box">
        <EditorNavigate sctiveComponent={type} />
      </div>
      <div className="Main-Box" style={{ display: 'flex', justifyContent: 'center',  height: '100vh' }}>
        {renderComponent()}
      </div>
    </div>
  );
}

export default EditorMain;
