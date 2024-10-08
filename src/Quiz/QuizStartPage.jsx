import React, { useEffect, useState } from "react";
import "./css/QuizStartPage.css"
import Navigate from "../Navigate";
import { useNavigate, useParams} from 'react-router-dom';


function QuizStartPage() {

    
    const [quizData, setQuizData] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();

    const handleClickToStart = (Number) => {
        navigate(`/quiz/${id}`, { state: { Number } });
    };


    useEffect(() => {

        fetch(`http://localhost:4000/api/quizClass/imageUrl/${id}`)
          .then(response => response.json())
          .then(data => setQuizData(data))  
          .catch(error => console.error('데이터 가져오기 실패:', error));
      }, [id]);


    



  return (
    <div>
        
    <div className="Navigate-Box">
        <Navigate />
    </div>
       
   


    <div className="Main-Box-QuizStartPage" style={{ display: 'flex', alignItems: 'center', height: '100vh'  }}>
        <div className="content-Box">
            <img
                src={`http://localhost:4000/${quizData}`}
                alt="Quiz"
                style={{ width: "400px", height: "auto" }}
            />
            <div className="descript-Box">
                <div className="description">00000 0 000 000 00</div>
                <div className="Number-Button-Box">
                    <button className="Number-Button" onClick={() => handleClickToStart(10)}>10 문제</button>
                    <button className="Number-Button" onClick={() => handleClickToStart(20)} style={{ marginLeft: '40px' }}>20 문제</button>
                </div>
            </div>
        </div>
    </div>
    


  
    </div>
  );
}

export default QuizStartPage;
