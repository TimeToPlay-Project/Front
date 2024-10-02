import React from "react";
import "./css/Quiz.css"
import Navigate from "../Navigate";
import { useNavigate } from 'react-router-dom';
import ContentBox from "../Common/ContentBox";


function Quiz() {

  const A = [1,2,3,4,5,6,7,1,1,1,1,1,1];

  const navigate = useNavigate();

    const handleClickToQuiz = () => {
        navigate('/quiz_');
    };


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,       
      behavior: 'smooth'    
    });
  };
    


  return (
    <div>
        
    <div className="Navigate-Box">
        <Navigate />
    </div>
       
   


    <div className="Quiz-Main-Box">
      <div className="Quiz-Total-Box">
        {A.map((item, index) => (
          <div className="Quiz-Box" onClick={handleClickToQuiz}>
            <ContentBox key={index} /> 
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
