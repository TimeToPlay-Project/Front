<<<<<<< HEAD
import React, { useState } from "react";
import "./css/TestContent.css";

function TestContent() {
  const [progress, setProgress] = useState(33); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [answers, setAnswers] = useState([]);

  const Data = ['11111', '22222', '33333'];
  const QData = ["샘플 질문1", "샘플 질문2", "샘플 질문3"]; 
  const IData = ["/Logoo.png", "/Logo3.png", "/Logo.png"]; 
  console.log("최종 선택한 답변들:", answers);

  const Next = (index) => {
    setAnswers(prevAnswers => [...prevAnswers, index]);

    if (currentIndex < QData.length - 1) {
      setCurrentIndex(currentIndex + 1); 
      setProgress(progress + 33); 
    } 
  };

  return (
    <div className="TestBox">
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="image-container">
        <img className="Test-Content-Img" src={IData[currentIndex]} alt="Question visual" style={{ width: '200px', height: 'auto' }} />
      </div>

      <div className="question">
        <p>{QData[currentIndex]}</p>
      </div>

      <div className="button-container">
        {Data.map((item, index) => (
          <button key={index} onClick={() => Next(index)}>{item}</button>
        ))}
      </div>
    </div>
  );
}

export default TestContent;
=======
import React, { useState } from "react";
import "./css/TestContent.css";

function TestContent() {
  const [progress, setProgress] = useState(33); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [answers, setAnswers] = useState([]);

  const Data = ['11111', '22222', '33333'];
  const QData = ["샘플 질문1", "샘플 질문2", "샘플 질문3"]; 
  const IData = ["/Logoo.png", "/Logo3.png", "/Logo.png"]; 
  console.log("최종 선택한 답변들:", answers);

  const Next = (index) => {
    setAnswers(prevAnswers => [...prevAnswers, index]);

    if (currentIndex < QData.length - 1) {
      setCurrentIndex(currentIndex + 1); 
      setProgress(progress + 33); 
    } 
  };

  return (
    <div className="TestBox">
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="image-container">
        <img className="Test-Content-Img" src={IData[currentIndex]} alt="Question visual" style={{ width: '200px', height: 'auto' }} />
      </div>

      <div className="question">
        <p>{QData[currentIndex]}</p>
      </div>

      <div className="Test-button-container">
        {Data.map((item, index) => (
          <button className="Test-button" key={index} onClick={() => Next(index)}>{item}</button>
        ))}
      </div>
    </div>
  );
}

export default TestContent;
>>>>>>> 1db3dfa4f2ddfde8fee81c4d870dfc338aa90978
