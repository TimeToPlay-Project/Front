import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import AdminContentBox from "./AdminContentBox";
import "./css/QuizComponent.css";


function TournamentComponent() {
  const [tournamentData, setTournamentData] = useState([]); 
  const [contentState, setContentState] = useState(false);
  const [contentIndex, setContentIndex] = useState(0);
  const [editorState, setEditorState] = useState(false);


  const navigate = useNavigate();


  const handleClickTournament = (id) => {
 
  }

  const handleClickCreateNon = () =>{
    setEditorState(false);
  }

  const handleClickCreate = () =>{
    setEditorState(true);
  }


 
  useEffect(() => {

    fetch('http://localhost:4000/api/tournament/all')
      .then(response => response.json())
      .then(data => setTournamentData(data))  
      .catch(error => console.error('데이터 가져오기 실패:', error));
  }, [contentState]);

  

  return (
    <div>
      {editorState ? ( 




          <div>

          <div>sss</div>


          <div>
            <button onClick={handleClickCreateNon}>Main</button>
          </div>


          </div>








      ):(
    <>

      <div className="Admin-Create-Button-Box">
        <button className="Admin-Create-Button"  onClick={handleClickCreate}>Create</button>
      </div>
      

      <div className="QuizComponent-Main-Box">
        <div className="QuizComponent-Total-Box">
          {tournamentData.map((item, index) => (
            <div className="QuizComponent-Box" key={index} onClick={() => handleClickTournament(item.id)}>
              <AdminContentBox
                title={item.title} 
                id = {index}
                description={item.description}  
                setEditorState = {setEditorState}
                setContentIndex = {setContentIndex} 
                imageUrl={`http://localhost:4000/${item.thumbnail}`}  
                
              />
            </div>
          ))}
        </div>
      </div>
      </>
      )}

   
    </div>
  );
}

export default TournamentComponent;
