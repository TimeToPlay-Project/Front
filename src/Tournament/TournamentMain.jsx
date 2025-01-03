import { useState, useEffect } from "react";
import "./css/Tournament.css";
import Navigate from "../Navigate";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

function TournamentMain() {
    const { id, selectedCount } = useParams();
    const [currentRound, setCurrentRound] = useState(1);
    const [currentImages, setCurrentImages] = useState([]);
    const [nextRoundImages, setNextRoundImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const handleClickToTournament = () => {
        navigate('/tournament');
    }

    const handleClickToRestart = () => {
        navigate(`/tournament/start/${id}`);
    }

    const handleClickToTournamentRanking = () => {
        navigate(`/tournament/ranking/${id}`);
    }


    const getTournamentImages = (id, count) => {
        fetch(`http://localhost:4000/api/tournament/images/${id}/${count}`)
        .then(response => response.json())
        .then(data => {
            setNextRoundImages([]);
            // setCurrentImages(Object.entries(data));
            setCurrentImages(data);
            setIsLoading(false);
        })
        .catch(error => console.error('Error fetching tournament images', error));
    }

    const updateTournamentWinner = (winnerId) => {
        fetch(`http://localhost:4000/api/tournament/winner/${winnerId}`)
        .then(response => response.json())
        .then(data => {
            console.log('update tournament winner', data);
        })
        .catch(error => console.error('error updating tournament winnder', error));
    }

    useEffect(() => {
        getTournamentImages(id, selectedCount);
    }, []);

    useEffect(() => {
        if (currentImages.length === 1) {
            const winnerId = currentImages[0]['id'];
            updateTournamentWinner(winnerId);
        }
    }, [currentImages]);
    

    console.log(currentImages);

    const handleImageClick = (image) => {
        setNextRoundImages((prevNextRoundImages) => {
            const updatedNextRoundImages = [...prevNextRoundImages, image];
    
            const remainingImages = currentImages.slice(2);
    
            if (remainingImages.length === 0) {
                setCurrentRound(currentRound + 1);
                setCurrentImages(updatedNextRoundImages);
                setNextRoundImages([]);
            } else {
                setCurrentImages(remainingImages);
            }
    
            console.log("updatedNextRoundImages:", updatedNextRoundImages);
            return updatedNextRoundImages;
        });
    };


    
    
    
    if (isLoading) {
        return <div>Loading...</div>; // 로딩 메시지
    }

    return (
        <div>
            <div className="Naviagte-Box">
                <Navigate/>
            </div>
            <div className="tournament-main">
                {currentImages.length > 1 ? (
                    <div>
                        <h2>Round {currentRound}</h2>
                        <div className="tournament-image-pair">
                            <div 
                                className="tournament-image-box"
                                onClick={() => handleImageClick(currentImages[0])}
                            >
                                <img src={`http://localhost:4000/${currentImages[0]['image_url']}`} alt="" />
                            </div>
                            <div 
                                className="tournament-image-box"
                                onClick={() => handleImageClick(currentImages[1])}
                            >
                                <img src={`http://localhost:4000/${currentImages[1]['image_url']}`} alt="" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="tournament-result-box">
                        <div className="tournament-winner">
                            <h2>우승</h2>
                            <img src={`http://localhost:4000/${currentImages[0]['image_url']}`} alt="" />
                        </div>
                        <div>
                            <div className="tournament-menu-box">
                                <button type="button" onClick={() => handleClickToRestart()}>다시시작</button>
                                <button type="button" onClick={() => handleClickToTournamentRanking()}>랭킹보기</button>
                                <button type="button" onClick={() => handleClickToTournament()}>다른 월드컵보기</button>
                            </div>
                            <div></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TournamentMain;