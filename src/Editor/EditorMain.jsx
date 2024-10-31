import React, { useState } from "react";
import { useParams } from 'react-router-dom';
import "../css/Main.css";
import EditorNavigate from "./EditorNavigate";
import QuizComponent from "./Component/QuizComponent";
import TestComponent from "./Component/TestComponent";
import TournamentComponent from "./Component/TournamentComponent";



function EditorMain() {
  const { type } = useParams();

  const renderComponent = () => {
    switch (type) {
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
        <EditorNavigate type={type} />
      </div>
      <div className="Main-Box" style={{ display: 'flex', justifyContent: 'center',  height: '100vh' }}>
        {renderComponent()}
      </div>
    </div>
  );
}

export default EditorMain;
