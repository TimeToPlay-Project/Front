
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
  const [bgColor, setBgColor] = useState("rgb(247, 247, 247)"); 

  useEffect(() => {
    console.log("현재 answerState:", answerState);
  }, [answerState]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/quiz/${id}/${Number}`);
        const data = await response.json();
        console.log(id);
        console.log(data);
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
  }, [id,Number]);

  const handleInputChange = (e) => {
    setInputAnswer(e.target.value);
  };

  const handleSubmit = () => {
    if (currentQuestion === quizzes.length - 1) {
      if (inputAnswer === quizzes[currentQuestion].answer) {
        submitQuizResults(answerState + 1);
        return;
      }
      else{
        submitQuizResults(answerState);
        return;
      }
    
    }
    if (inputAnswer === quizzes[currentQuestion].answer) {
      setFeedback('정답');
      setAnswer(quizzes[currentQuestion].answer);
      setAnswerState(prevState => {
        const newState = prevState === 0 ? 1 : prevState + 1; 
        console.log("정답 개수:", newState); 
        return newState;
      });
  
      console.log(answerState);
      setBgColor("linear-gradient(45deg, #3967fd, #b0c8fa, #d0d0e6, #4b4dec)"); 
    } else {
      setFeedback('오답');
      setAnswer(quizzes[currentQuestion].answer);
      setBgColor("linear-gradient(45deg, #fa5252, #fab4b4, #e6d9d0, #fa5e53)"); 
    }
    setShowFeedback(true); 
  };

  const handleNextQuestion = () => {
    setShowFeedback(false); 
    setInputAnswer(""); 
    setBgColor("transparent"); 

    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setFeedback("퀴즈 완료!"); 
      setQuizCompleted(true); 
    }
  };

  const submitQuizResults = async (answerNumber) => {

    console.log("정답 개수 : " + answerNumber);

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
        console.log('퀴즈 결과가 성공적으로 전송되었습니다.');
        navigate(`/quiz/result/${id}`, { state: { answerNumber } });
      } else {
        console.error('퀴즈 결과 전송 실패');
      }
    } catch (error) {
      console.error('서버와의 통신 중 오류 발생:', error);
    }
  };

  

  return (
    <div style={{ background: bgColor, transition: "background 0.3s ease" }}> 
      <div className="Navigate-Box">
        <Navigate />
      </div>

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
            <div className="Quiz-Image">
              <img
                src={`http://localhost:4000/${quizzes[currentQuestion].imageUrl}`}
                alt="Quiz"
                style={{ width: "500px", height: "400px" }}
              />
            </div>

            {!showFeedback ? (
              <div className="Quiz-Input">
                <input
                  type="text"
                  value={inputAnswer}
                  onChange={handleInputChange}
                  placeholder="정답"
                />
                <button onClick={handleSubmit}>정답</button>
              </div>
            ) : (
              <div className="Feedback">
                <p>{feedback}</p>
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
            )}
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
  );
}

export default QuizMain;
