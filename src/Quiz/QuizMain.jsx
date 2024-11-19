import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import "./css/QuizMain.css";
import Navigate from "../Navigate";
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const StyledQuizMain = styled.div`
  width: 95%;
  max-width: 1200px;
  height: calc(100vh - 80px); 
  margin: 0.5rem auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 98%;
    padding: 0.5rem;
    height: calc(100vh - 60px);
  }
`;

const StyledQuizContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: 100%;
`;

const StyledProgressContainer = styled.div`
   width: 100%;
  margin-bottom: 0.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center; /* 가운데 정렬 */

  .quiz-progress {
    width: 100%;
    max-width: 700px; /* 너비 제한 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .quiz-progress span {
    font-size: 1.1rem;
    margin-bottom: 0.3rem;
  }

  .progress-bar {
    height: 6px;
  }
`;

const StyledImageBox = styled.div`
  width: 100%;
  margin-bottom: 50px;
  max-width: 500px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 12px;
  }

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const StyledInputContainer = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 0.5rem;
  }
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 0.7rem 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;

  &:focus {
    outline: none;
    border-color: #2D8CFF;
  }
`;

const StyledButton = styled.button`
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  min-width: 100px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledFeedbackContainer = styled.div`
  width: 100%;
  max-width: 500px;
  text-align: center;
  animation: fadeInScale 0.3s ease-out;

  .Feedback-Overlay {
    margin: 1rem 0;
  }

  .Feedback-Image {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  .Quiz-Answer-Box {
    padding: 1.5rem;
    background: rgba(45, 140, 255, 0.1);
    border-radius: 12px;
  }

  .Quiz-Feedback {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }

  .Answer {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>퀴즈를 불러오는 중...</p>
    </div>
  );
}

function QuizMain() {
  const location = useLocation();
  const { Number } = location.state;
  const { id } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [inputAnswer, setInputAnswer] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerState, setAnswerState] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/quiz/${id}/${Number}`);
        if (!response.ok) {
          throw new Error('퀴즈 데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setQuizzes(data.length === 0 ? [] : data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [id, Number]);

  const handleInputChange = (e) => {
    setInputAnswer(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputAnswer.trim()) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputAnswer.trim()) return;

    const isCorrect = inputAnswer === quizzes[currentQuestion].answer;
    
    if (currentQuestion === quizzes.length - 1) {
      submitQuizResults(isCorrect ? answerState + 1 : answerState);
      return;
    }

    setFeedback(isCorrect ? '정답' : '오답');
    setAnswer(quizzes[currentQuestion].answer);
    
    if (isCorrect) {
      setAnswerState(prev => prev + 1);
    }
    
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setInputAnswer("");
    setFeedback("");

    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const submitQuizResults = async (answerNumber) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/quiz/results/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizClassId: id,
          answerNumber: answerNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('퀴즈 결과 제출에 실패했습니다.');
      }

      navigate(`/quiz/result/${id}`, { state: { answerNumber } });
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="Quiz-Main-Box">
        <Navigate />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="Quiz-Main-Box">
        <Navigate />
        <div className="error-message">
          <p>{error}</p>
          <button className="Home-Button" onClick={() => navigate('/quiz')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="Quiz-Main-Box">
      <Navigate />
      <StyledQuizMain>
        {quizzes.length > 0 ? (
          <>
            <StyledProgressContainer>
              <div className="quiz-progress">
                <span>문제 {currentQuestion + 1} / {quizzes.length}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${((currentQuestion + 1) / quizzes.length) * 100}%` }}
                  />
                </div>
              </div>
            </StyledProgressContainer>

            <StyledQuizContainer>
              <StyledImageBox>
                <img
                  src={`${process.env.REACT_APP_API_URL}/${quizzes[currentQuestion].imageUrl}`}
                  alt="Quiz"
                />
              </StyledImageBox>

              {showFeedback ? (
                <StyledFeedbackContainer>
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
                    <StyledButton 
                      className="Next-Button"
                      onClick={handleNextQuestion}
                    >
                      {currentQuestion === quizzes.length - 1 ? '결과 보기' : '다음 문제'}
                    </StyledButton>
                  </div>
                </StyledFeedbackContainer>
              ) : (
                <StyledInputContainer>
                  <StyledInput
                    type="text"
                    value={inputAnswer}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="정답을 입력하세요"
                    autoFocus
                  />
                  <StyledButton 
                    className="Quiz-Answer-Button"
                    onClick={handleSubmit}
                    disabled={!inputAnswer.trim()}
                  >
                    정답 확인
                  </StyledButton>
                </StyledInputContainer>
              )}
            </StyledQuizContainer>
          </>
        ) : (
          <div className="No-Content">
            <div>아직 준비된 퀴즈가 없습니다</div>
            <button className="Home-Button" onClick={() => navigate('/quiz')}>
              홈으로 돌아가기
            </button>
          </div>
        )}
      </StyledQuizMain>
    </div>
  );
}

export default QuizMain;
