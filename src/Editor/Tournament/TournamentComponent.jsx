import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import EditorContentBox from "../EditorContentBox";


function TournamentComponent() {
  const [tournamentData, setTournamentData] = useState([]); 


  const navigate = useNavigate();


  const handleClickTournament = (id) => {
 
  }

  const handleClickCreate = () =>{
    navigate('/editor/tournament/edit/new');
  }


 
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/tournament/all`)
      .then(response => response.json())
      .then(data => setTournamentData(data))  
      .catch(error => console.error('데이터 가져오기 실패:', error));
  }, []);

  

  return (
    <div>
      <div className="Editor-Create-Button-Box">
        <button className="Editor-Create-Button"  onClick={handleClickCreate}>Create</button>
      </div>
      

      <div className="QuizComponent-Main-Box">
        <div className="QuizComponent-Total-Box">
          {tournamentData.map((item, index) => (
            <div className="QuizComponent-Box" key={index} onClick={() => handleClickTournament(item.id)}>
              <EditorContentBox
                title={item.title} 
                id = {item.id}
                description={item.description}  
                imageUrl={`${process.env.REACT_APP_API_URL}/${item.thumbnail}`}  
                type="tournament"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TournamentComponent;
