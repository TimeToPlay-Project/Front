import React, { useEffect, useState } from "react";
import "./css/Test.css";
import Navigate from "../Navigate";
import { useNavigate } from 'react-router-dom';
import ContentBox from "../Common/ContentBox";

function Test() {
  const [testData, setTestData] = useState([]); 

  const navigate = useNavigate();

  const handleClickToTest = (id) => {
    navigate(`/test/start/${id}`);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

 
  useEffect(() => {

    fetch('http://localhost:4000/api/testClass/all')
      .then(response => response.json())
      .then(data => setTestData(data))  
      .catch(error => console.error('데이터 가져오기 실패:', error));
  }, []);

  return (
    <div>
      <div className="Navigate-Box">
        <Navigate />
      </div>

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

export default Test;
