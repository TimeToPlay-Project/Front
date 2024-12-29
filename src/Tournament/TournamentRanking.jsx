import { useState, useEffect } from "react";
import "./css/Tournament.css";
import "./css/TournamentRanking.css";
import Navigate from "../Navigate";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"; // BarChart 컴포넌트를 가져옵니다.
import { useNavigate, useParams } from "react-router-dom";

function TournamentRanking() {
    const { id } = useParams();
    const [tournamentRanking, setTournamentRanking] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const handleClickToTournament = () => {
        navigate('/tournament');
    }

    const handleClickToTournamentRestart = () => {
        navigate(`/tournament/start/${id}`);
    }

    const getTournamentRanking = (id) => {
        fetch(`http://localhost:4000/api/tournament/ranking/${id}`)
        .then(response => response.json())
        .then(data => {
            setTournamentRanking(data);
            setIsLoading(false);
        })
        .catch(error => console.error('Error fetching tournament rankings', error));
    }

    useEffect(() => {
        getTournamentRanking(id);
    }, []);

    const BarChartComponent = ({ dataValue }) => {
        const data = [
            { rate: dataValue }
        ];

        return (
            <BarChart 
                width={100} height={40} data={data}
                layout="horizontal"
            >
                <XAxis domain={[0, 100]} hide/>
                <YAxis type="category" dataKey="name" hide />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar dataKey="rate" fill="rgba(75, 192, 192, 0.6)" />
            </BarChart>
        );
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="Naviagte-Box">
                <Navigate/>
            </div>
            <div className="tournament-main">
                <div className="tournament-ranking-box">
                    <div className="tournament-ranking-table-box">
                        <table className="tournament-ranking-table">
                            <thead>
                                <tr>
                                    <th style={{width: '10%'}}>순위</th>
                                    <th style={{width: '30%'}}>이미지</th>
                                    <th style={{width: '30%'}}>이름</th>
                                    <th style={{width: '30%'}}>우승비율</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tournamentRanking.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index+1}</td>
                                        <td>
                                            <img src={`http://localhost:4000/${item.url}`} alt="" />
                                        </td>
                                        <td>{item.name}</td>
                                        <td>
                                            <div className="tournament-ranking-rate-box">
                                                <div className="rate-bar">
                                                    <div className="rate-bar-fill" style={{width: `${item.rate}%`}}></div>
                                                </div>
                                                <span>{item.rate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="tournament-ranking-button-box">
                        <button type="button" onClick={() => handleClickToTournamentRestart()}>다시시작</button>
                        <button type="button" onClick={() => handleClickToTournament()}>다른 월드컵보기</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TournamentRanking;