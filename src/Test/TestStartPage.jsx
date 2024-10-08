import React, { useEffect, useState } from "react";
import "./css/TestStartPage.css"
import Navigate from "../Navigate";
import { useNavigate, useParams} from 'react-router-dom';


function TestStartPage() {

    
    const [testData, setTestData] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();

    const handleClickToStart = (Number) => {
        navigate(`/test/${id}`, { state: { Number } });
    };


    useEffect(() => {

        fetch(`http://localhost:4000/api/testClass/imageUrl/${id}`)
          .then(response => response.json())
          .then(data => setTestData(data))  
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
                src={`http://localhost:4000/${testData}`}
                alt="Quiz"
                style={{ width: "400px", height: "auto" }}
            />
            <div className="descript-Box">
                <div className="description">00000 0 000 000 00</div>
                <div className="TestStart-Button-Box">
                    <button className="TestStart-Button" onClick={() => handleClickToStart(10)}>테스트 시작</button>
           
                </div>
            </div>
        </div>
    </div>
    


  
    </div>
  );
}

export default TestStartPage;
