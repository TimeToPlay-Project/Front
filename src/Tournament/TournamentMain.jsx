import { useState, useEffect } from "react";
import "./css/Tournament.css";
import Navigate from "../Navigate";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

function TournamentMain() {
    const { id, selectedCount } = useParams();
    const [currentCount, setCurrentCount] = useState();
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

    const shuffleImages = (images) => {
        return images.sort(() => Math.random() - 0.5);
    }


    const getTournamentImages = (id, count) => {
        fetch(`${process.env.REACT_APP_API_URL}/api/tournament/images/${id}/${count}`)
        .then(response => response.json())
        .then(data => {
            setNextRoundImages([]);
            setCurrentImages(data);
            setCurrentCount(count);
            setIsLoading(false);
        })
        .catch(error => console.error('Error fetching tournament images', error));
    }

    const updateTournamentWinner = (winnerId) => {
        fetch(`${process.env.REACT_APP_API_URL}/api/tournament/winner/${winnerId}`)
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
                setCurrentRound(1);
                setCurrentCount(updatedNextRoundImages.length);
                setCurrentImages(shuffleImages(updatedNextRoundImages));
                setNextRoundImages([]);
            } else {
                setCurrentRound(currentRound + 1);
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
                        <h2 className="tournament-title">
                            {currentCount === 2 
                                ? '결승' 
                                : currentCount === 4 
                                ? '준결승' 
                                : `${currentCount}강`
                            } 
                            (Round {currentRound} / {currentCount / 2})
                        </h2>
                        <div className="tournament-image-pair">
                            <div 
                                className="tournament-image-box"
                                onClick={() => handleImageClick(currentImages[0])}
                            >
                                <span>{currentImages[0]['image_name']}</span>
                                <img src={`${process.env.REACT_APP_API_URL}/${currentImages[0]['image_url']}`} alt="" />
                            </div>

                            <div className="tournament-vs">
                                <span>VS</span>
                            </div>
                            
                            <div 
                                className="tournament-image-box"
                                onClick={() => handleImageClick(currentImages[1])}
                            >
                                <span>{currentImages[1]['image_name']}</span>
                                <img src={`${process.env.REACT_APP_API_URL}/${currentImages[1]['image_url']}`} alt="" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="tournament-result-box">
                        <div className="tournament-winner">
                            <h2>우승: {currentImages[0]['image_name']}</h2>
                            <img src={`${process.env.REACT_APP_API_URL}/${currentImages[0]['image_url']}`} alt="" />
                        </div>
                        <div className="tournament-menu-box">
                            <button type="button" onClick={() => handleClickToRestart()}>다시시작</button>
                            <button type="button" onClick={() => handleClickToTournamentRanking()}>랭킹보기</button>
                            <button type="button" onClick={() => handleClickToTournament()}>다른 월드컵보기</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TournamentMain;