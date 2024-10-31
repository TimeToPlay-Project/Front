import React, { useEffect, useState } from "react";
import "./css/TestComponent.css";
import { useNavigate } from 'react-router-dom';
import EditorContentBox from "./EditorContentBox";

function TestComponent() {
  const [testData, setTestData] = useState([]); 

  const navigate = useNavigate();

  const handleClickToTest = (id) => {
  };

  const handleClickCreate = () =>{
    navigate('/editor/test/edit/new');
  }

  const handleClickCreateNon = () =>{
  }




 
  useEffect(() => {

    fetch('http://localhost:4000/api/testClass/all')
      .then(response => response.json())
      .then(data => setTestData(data))  
      .catch(error => console.error('데이터 가져오기 실패:', error));
  }, []);

  return (
    <div>
      <div className="Editor-Create-Button-Box">
        <button className="Editor-Create-Button"  onClick={handleClickCreate}>Create</button>
      </div>
      <div className="TestComponent-Main-Box">
        <div className="TestComponent-Total-Box">
          {testData.map((item, index) => (
            <div className="TestComponent-Box" key={index} onClick={() => handleClickToTest(item.id)}>
              <EditorContentBox
                title={item.title} 
                id = {item.id}
                description={item.description}
                imageUrl={`http://localhost:4000/${item.imageUrl}`}
                type = "test"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestComponent;
