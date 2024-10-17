
import React, { useEffect, useState } from "react";
import "./css/QuizComponent.css";
import { useNavigate } from 'react-router-dom';
import ContentBox from "./AdminContentBox";

function QuizComponent() {
  const [quizData, setQuizData] = useState([]); 


  const handleClickToQuiz = () =>{

  }

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

      <div className="Admin-Create-Button-Box">
        <button className="Admin-Create-Button">Create</button>
      </div>
      

      <div className="QuizComponent-Main-Box">
        <div className="QuizComponent-Total-Box">
          {quizData.map((item, index) => (
            <div className="QuizComponent-Box" key={index} onClick={() => handleClickToQuiz(item.id)}>
              <ContentBox
                title={item.title} 
                id = {index}
                description={item.description}  
                imageUrl={`http://localhost:4000/${item.imageUrl}`}  
              />
            </div>
          ))}
        </div>
      </div>

      
    </div>
  );
}

export default QuizComponent;