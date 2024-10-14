
import React, { useEffect, useState } from "react";
import "./css/Quiz.css";
import Navigate from "../Navigate";
import { useNavigate } from 'react-router-dom';
import ContentBox from "../Common/ContentBox";

function Quiz() {
  const [quizData, setQuizData] = useState([]); 

  const navigate = useNavigate();

  const handleClickToQuiz = (id) => {
    navigate(`/quiz/start/${id}`);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

 
  useEffect(() => {

    fetch('http://localhost:4000/api/quizClass/all')
      .then(response => response.json())
      .then(data => setQuizData(data))  
      .catch(error => console.error('데이터 가져오기 실패:', error));
  }, []);

  return (
    <div>
      <div className="Navigate-Box">
        <Navigate />
      </div>

      <div className="Quiz-Main-Box">
        <div className="Quiz-Total-Box">
          {quizData.map((item, index) => (
            <div className="Quiz-Box" key={index} onClick={() => handleClickToQuiz(item.id)}>
              <ContentBox
                title={item.title} 
                description={item.description}  
                imageUrl={`http://localhost:4000/${item.imageUrl}`}  
              />
            </div>
          ))}
        </div>
      </div>

      <div className="Top-Button">
        <img
          onClick={scrollToTop}
          src={`${process.env.PUBLIC_URL}/Top-Button.png`}
          alt="Logo"
          style={{ width: '45px', height: 'auto' }}
        />
      </div>
    </div>
  );
}

export default Quiz;
