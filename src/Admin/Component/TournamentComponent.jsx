import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import ContentBox from "./AdminContentBox";
import "./css/QuizComponent.css";


function TournamentComponent() {
  const [tournamentData, setTournamentData] = useState([]); 
  const navigate = useNavigate();


  const handleClickTournament = (id) => {
 
  }

 
  useEffect(() => {

    fetch('http://localhost:4000/api/tournament/all')
      .then(response => response.json())
      .then(data => setTournamentData(data))  
      .catch(error => console.error('데이터 가져오기 실패:', error));
  }, []);

  

  return (
    <div>

      <div className="Admin-Create-Button-Box">
        <button className="Admin-Create-Button">Create</button>
      </div>
      

      <div className="QuizComponent-Main-Box">
        <div className="QuizComponent-Total-Box">
          {tournamentData.map((item, index) => (
            <div className="QuizComponent-Box" key={index} onClick={() => handleClickTournament(item.id)}>
              <ContentBox
                title={item.title} 
                description={item.description}  
                imageUrl={`http://localhost:4000/${item.thumbnail}`}  
              />
            </div>
          ))}
        </div>
      </div>

   
    </div>
  );
}

export default TournamentComponent;
