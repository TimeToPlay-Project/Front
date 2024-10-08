import { useState, useEffect } from "react";
import "./css/Tournament.css";
import Navigate from "../Navigate";

function TournamentMain() {
    const [currentRound, setCurrentRound] = useState(1);
    const [currentImages, setCurrentImages] = useState([]);
    const [nextRoundImages, setNextRoundImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/tournament/images/1/8')
            .then(response => response.json())
            .then(data => {
                setNextRoundImages([]);
                setCurrentImages(Object.entries(data));
                setIsLoading(false);
            })
            .catch(error => console.error('Error fetching tournament images', error));
    }, []);

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
                                <img src={currentImages[0][1]} alt="" />
                            </div>
                            <div 
                                className="tournament-image-box"
                                onClick={() => handleImageClick(currentImages[1])}
                            >
                                <img src={currentImages[1][1]} alt="" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <img src={currentImages[0][1]} alt="" />
                    </div>
                )}
            </div>
        </div>
    )
}

export default TournamentMain;