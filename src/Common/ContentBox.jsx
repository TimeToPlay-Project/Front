import React from "react";
import "./ContentBox.css"

function ContentBox() {

  
  return (
    <div className="QuizBox">
      <div>
        <img 
          src={`${process.env.PUBLIC_URL}/QUIZ.jpeg`} 
          alt="Quiz" 
        />
      </div>
      <div className="hover-text"><div className="Quiz-Descript">남다른 상식문제를 통해 새로운 상식기준을 측정 해보세요</div></div> 
      <div className="Quiz-title">아이돌 이상형월드컵</div> 
    </div>
  );
}

export default ContentBox;
