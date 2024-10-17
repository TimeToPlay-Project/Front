import React, { useEffect, useState } from "react";
import "./css/TestComponent.css";
import { useNavigate } from 'react-router-dom';
import ContentBox from "./AdminContentBox";

function TestComponent() {
  const [testData, setTestData] = useState([]); 

  const navigate = useNavigate();

  const handleClickToTest = (id) => {
  };



 
  useEffect(() => {

    fetch('http://localhost:4000/api/testClass/all')
      .then(response => response.json())
      .then(data => setTestData(data))  
      .catch(error => console.error('데이터 가져오기 실패:', error));
  }, []);

  return (
    <div>
      

      <div className="Test-Main-Box">
        <div className="Test-Total-Box">
          {testData.map((item, index) => (
            <div className="Test-Box" key={index} onClick={() => handleClickToTest(item.id)}>
              <ContentBox
                title={item.title} 
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

export default TestComponent;
