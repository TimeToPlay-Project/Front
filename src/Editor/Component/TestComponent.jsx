import React, { useEffect, useState } from "react";
import "./css/TestComponent.css";
import { useNavigate } from 'react-router-dom';
import EditorContentBox from "./EditorContentBox";

function TestComponent() {
  const [testData, setTestData] = useState([]); 
  const [contentState, setContentState] = useState(false);
  const [contentIndex, setContentIndex] = useState(0);
  const [createState, setCreateState] = useState(false);

  const navigate = useNavigate();

  const handleClickToTest = (id) => {
  };

  const handleClickCreate = () =>{
    navigate(`/editor/test/edit/new`);
  }

  const handleClickCreateNon = () =>{
    setCreateState(false);
  }




 
  useEffect(() => {

    fetch('http://localhost:4000/api/testClass/all')
      .then(response => response.json())
      .then(data => setTestData(data))  
      .catch(error => console.error('데이터 가져오기 실패:', error));
  }, [contentState]);

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
                id = {index}
                description={item.description}  
                setContentState = {setContentState}
                setContentIndex = {setContentIndex}
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
