import React, { useEffect, useState } from "react";
import "./css/TestMain.css"
import Navigate from "../Navigate";
import { useNavigate, useParams} from 'react-router-dom';
import TestContent from "./TestContent";


function TestMain() {

    
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
       
   


    <div className="Main-Box-Test" style={{ display: 'flex', alignItems: 'center', height: '100vh', justifyContent: 'center'  }}>
        
        <div className="TestContent-Box">
           <TestContent />
        </div>
           
    </div>
    


  
    </div>
  );
}

export default TestMain;
