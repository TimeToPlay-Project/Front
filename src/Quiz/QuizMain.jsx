import React, { useEffect, useState } from "react";
import "./css/QuizMain.css";
import Navigate from "../Navigate";
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function QuizMain() {
  const location = useLocation();
  const { Number } = location.state;
  const { id } = useParams();
  const navigate = useNavigate();

  const handleClickToHome = () => {
    navigate('/quiz');
  };

  const [quizzes, setQuizzes] = useState([]); 
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [inputAnswer, setInputAnswer] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerState, setAnswerState] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/quiz/${id}/${Number}`);
        const data = await response.json();
        if(data.length === 0){
          setQuizzes([]);
        }
        setQuizzes(data); 
        setLoading(false); 
      } catch (error) {
        console.error('퀴즈 데이터를 가져오는 중 에러 발생:', error);
        setLoading(false); 
      }
    };

    fetchQuizzes();
  }, [id, Number]);

  const handleInputChange = (e) => {
    setInputAnswer(e.target.value);
  };

  const handleSubmit = () => {
    if (currentQuestion === quizzes.length - 1) {
      if (inputAnswer === quizzes[currentQuestion].answer) {
        submitQuizResults(answerState + 1);
        return;
      } else {
        submitQuizResults(answerState);
        return;
      }
    }

    if (inputAnswer === quizzes[currentQuestion].answer) {
      setFeedback('정답');
      setAnswer(quizzes[currentQuestion].answer);
      setAnswerState(prevState => {
        const newState = prevState === 0 ? 1 : prevState + 1; 
        return newState;
      });
    } else {
      setFeedback('오답');
      setAnswer(quizzes[currentQuestion].answer);
    }
    
    setShowFeedback(true); 
  };

  const handleNextQuestion = () => {
    setShowFeedback(false); 
    setInputAnswer(""); 

    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setFeedback("퀴즈 완료!"); 
      setQuizCompleted(true); 
    }
  };

  const submitQuizResults = async (answerNumber) => {
    const resultData = {
      quizClassId: id,
      answerNumber: answerNumber, 
    };

    try {
      const response = await fetch('http://localhost:4000/api/quiz/results/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultData),
      });

      if (response.ok) {
        navigate(`/quiz/result/${id}`, { state: { answerNumber } });
      } else {
        console.error('퀴즈 결과 전송 실패');
      }
    } catch (error) {
      console.error('서버와의 통신 중 오류 발생:', error);
    }
  };

  return (
    <div> 
      <div className="Navigate-Box">
        <Navigate />
      </div>
      <div className="Quiz-Main-Box">
        <div className="Quiz-Main">
          {loading ? (
            <div className="No-Content">
              <div>준비중입니다...</div>
              <div className="Button-Box">
                <button className="Home-Button" onClick={handleClickToHome}>Home</button>
              </div>
            </div>
          ) : quizzes.length > 0 ? (
            <>
              <div className="Quiz-Container">
                <div className="Quiz-Image">
                  <img
                    src={`http://localhost:4000/${quizzes[currentQuestion].imageUrl}`}
                    alt="Quiz"
                    style={{ width: "500px", height: "400px" }}
                  />
                </div>
                {showFeedback && (
                  <div>
                  <div className="Feedback-Overlay">
                    <img
                      src={feedback === '정답' ? '/O.png' : '/X.png'}
                      alt={feedback}
                      className="Feedback-Image"
                    />
                    </div>
                    <div className="Quiz-Answer-Box">
                    <div className="Quiz-Feedback">{feedback}</div>
                    <div className="Answer">{answer}</div>
                    {quizCompleted ? (
                      <div>
                        <p>퀴즈를 완료하셨습니다!</p>
                        <button onClick={handleClickToHome}>홈으로 가기</button>
                      </div>
                    ) : (
                      <button onClick={handleNextQuestion} className="Next-Button">다음 문제</button>
                    )}
                  </div>
                  </div>
                )}
              </div>

              {!showFeedback ? (
                <div className="Quiz-Input">
                  <input
                    type="text"
                    value={inputAnswer}
                    onChange={handleInputChange}
                    placeholder="정답"
                  />
                  <button className="Quiz-Answer-Button" onClick={handleSubmit}>정답</button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="No-Content">
              <div>준비중입니다...</div>
              <div className="Button-Box">
                <button className="Home-Button" onClick={handleClickToHome}>Home</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizMain;
