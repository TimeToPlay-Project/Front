import React, { useState } from "react";
import "./css/QuizMain.css";
import Navigate from "../Navigate";
import { useNavigate } from 'react-router-dom';

function QuizMain() {

  const navigate = useNavigate();

    const handleClickToHome = () => {
        navigate('/quiz');
    };



  const B = ['New.jpeg', 'Korea.jpeg', 'China.jpeg'];


  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [inputAnswer, setInputAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false); 
  const [quizCompleted, setQuizCompleted] = useState(false); 

  const answers = ["뉴욕", "한국", "중국"];


  const handleInputChange = (e) => {
    setInputAnswer(e.target.value);
  };


  const handleSubmit = () => {
    if(currentQuestion === B.length -1){
      setFeedback("퀴즈 완료!"); 
      setQuizCompleted(true);
    }
    if (inputAnswer === answers[currentQuestion]) {
      setFeedback('O' + answers[currentQuestion]);
    } else {
      setFeedback('X' + answers[currentQuestion]);
    }
    setShowFeedback(true); // 피드백 표시
  };

 // 다음 문제로 넘어가기
 const handleNextQuestion = () => {

  setShowFeedback(false); // 피드백 숨기기
  setInputAnswer(""); // 입력창 초기화
  if (currentQuestion < B.length - 1) {
    setCurrentQuestion(currentQuestion + 1);
  } else {
    setFeedback("퀴즈 완료!"); // 마지막 문제인 경우
    setQuizCompleted(true); // 퀴즈 완료 상태 설정
  }
};


  return (
    <div>
      <div className="Navigate-Box">
        <Navigate />
      </div>

      <div className="Quiz-Main">
        <div className="Quiz-Image">
          <img
            src={`${process.env.PUBLIC_URL}/${B[currentQuestion]}`}
            alt="Quiz"
            style={{ width: "400px", height: "auto" }}
          />
        </div>

        {!showFeedback ? (
          <div className="Quiz-Input">
            <input
              type="text"
              value={inputAnswer}
              onChange={handleInputChange}
              placeholder="정답을 입력하세요"
            />
            <button onClick={handleSubmit}>제출</button>
          </div>
        ) : (
          <div className="Feedback">
            <p>{feedback}</p>
            {quizCompleted ? (
              <div>
                <p>퀴즈를 완료하셨습니다!</p>
                <button onClick={handleClickToHome}>홈으로 가기</button> 
              </div>
            ) : (
              <button onClick={handleNextQuestion}>다음 문제</button>
            )}
          </div>
        )}

       
      </div>
    </div>
  );
}

export default QuizMain;
