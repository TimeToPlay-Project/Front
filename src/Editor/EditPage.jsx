import React, { useState } from "react";
import { useParams } from 'react-router-dom';
import "../css/Main.css";
import EditorNavigate from "./EditorNavigate";
import QuizEditPage from "./Quiz/QuizEditPage";
import TestEditPage from "./Test/TestEditPage";
import TournamentEditPage from "./Tournament/TournamentEditPage";



function EditorMain() {
  const { type, id } = useParams();

  const renderComponent = () => {
    switch (type) {
      case 'quiz':
        return <QuizEditPage id={id}/>;
      case 'tournament':
        return <TournamentEditPage id={id}/>;
      case 'test':
        return <TestEditPage id={id}/>;
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
