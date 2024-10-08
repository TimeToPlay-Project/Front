import React, { useEffect, useState } from "react";
import "./css/TestContent.css";
import { useParams, useNavigate } from 'react-router-dom';

function TestContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [progress, setProgress] = useState(0); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [answers, setAnswers] = useState([]);
  const [testData, setTestData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeClass, setFadeClass] = useState('fade-in'); // 초기 애니메이션 상태
  const [questionClass, setQuestionClass] = useState('slide-in'); // 질문 애니메이션 상태

  useEffect(() => {
    console.log("id : " + id);

    fetch(`http://localhost:4000/api/test/${id}`)
      .then(response => response.json())
      .then(data => {
        setTestData(data);  
        console.log("Fetched test data: ", data); 
        setIsLoading(false);  
      }) 
      .catch(error => {
        console.error('데이터 가져오기 실패:', error);
        setIsLoading(false);  
      });

  }, [id]);

  useEffect(() => {
    setProgress(((currentIndex + 1) / (testData.length || 1)) * 100); 
  }, [currentIndex, testData.length]);

  const handleNext = (type) => {
    const newAnswers = [...answers, type]; 
    setAnswers(newAnswers);

    // 이미지 전환 시 애니메이션 적용
    setFadeClass('fade-out');
    setQuestionClass(''); // 질문 박스 초기화

    setTimeout(() => {
      if (currentIndex < testData.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setFadeClass('fade-in');  // 새로운 이미지가 나타날 때
        setQuestionClass('slide-in');  // 새로운 질문이 나타날 때
      } else {
        submitAnswers({ id, answers: newAnswers });
      }
    }, 600); // 애니메이션 지속 시간에 맞춤
  };

  const submitAnswers = ({ id, answers }) => {
    console.log(JSON.stringify({ id: id, answers: answers })); 
    fetch(`http://localhost:4000/api/test/submit`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id, answers: answers }), 
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return response.json();
      })
      .then(data => {
        console.log("서버로부터의 응답: ", data);
        navigate('/test/result', { state: { result: data } });
      })
      .catch(error => console.error('데이터 전송 실패:', error));
  };

  const handleClickToHome = () => {
    navigate('/test');
  };

  if (isLoading || testData.length === 0 || currentIndex >= testData.length) {
    return (
      <div className="No-Content">
        <div>준비중입니다...</div>
        <div className="Button-Box">
          <button className="Home-Button" onClick={handleClickToHome}>Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="TestBox">
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="image-container">
        {testData.length > 0 && currentIndex < testData.length && (
          <img 
            className={`Test-Content-Img ${fadeClass}`} 
            src={`http://localhost:4000/${testData[currentIndex].imageUrl}`} 
            alt="Question visual" 
          />
        )}
      </div>

      <div className={`question ${questionClass}`}>
        {testData.length > 0 && currentIndex < testData.length && (
          <div>{testData[currentIndex].question}</div>
        )}
      </div>

      <div className="Test-button-container">
        {testData.length > 0 && currentIndex < testData.length && (
          testData[currentIndex].answers.map((item, index) => (
            <button className="Test-button" key={index} onClick={() => handleNext(item.type)}>{item.answer}</button>
          ))
        )}
      </div>
    </div>
  );
}

export default TestContent;
