import React, { useEffect, useState } from "react";
import "./css/TournamentStartPage.css"
import Navigate from "../Navigate";
import { useNavigate, useParams} from 'react-router-dom';


function TournamentStartPage() {
    const [TournamentStartData, setTournamentStartData] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    const handleClickToStart = () => {
        const selectElement = document.getElementById('tournament-round-select');
        const selectedCount = selectElement.value;
        navigate(`/tournament/${id}/${selectedCount}`);
    };

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/tournament/start/${id}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('tournament count response not ok');
            }
            return response.json();
          })
          .then(data => {
            console.log(data);
            setTournamentStartData(data);
          })
          .catch(error => console.error('Error fetching tournament data:', error));
      }, [id]);

  return (
    <div>
      <div className="Navigate-Box">
          <Navigate />
      </div>

      <div className="Main-Box-TournamentStartPage">
        {TournamentStartData.tournament ? (
          <div className="Tournament-content-Box">
            <img
                src={`${process.env.REACT_APP_API_URL}/${TournamentStartData.tournament?.thumbnail}`}
                style={{ width: "400px", height: "auto" }}
            />
            <h3>{TournamentStartData.tournament?.title}</h3>
            <div className="Tournament-descript-Box">
                <div className="Tournament-description">{TournamentStartData.tournament?.description}</div>
                
            </div>
            <div className="Tournament-select-box">
                <span><b>총 라운드</b></span>
                <select id="tournament-round-select">
                    {TournamentStartData.counts?.map((count) => (
                    <option key={count.key} value={count.key}>
                        {count.value}
                    </option>
                    ))}
                </select>
            </div>
            <div className="TournamentStart-Button-Box">
                <button className="TournamentStart-Button" onClick={() => handleClickToStart()}>시작</button>
            </div>
        </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default TournamentStartPage;
