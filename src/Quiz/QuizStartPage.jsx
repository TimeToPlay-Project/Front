import React, { useEffect, useState } from "react";
import "./css/QuizStartPage.css";
import Navigate from "../Navigate";
import { useNavigate, useParams } from 'react-router-dom';

function QuizStartPage() {
    const [quizData, setQuizData] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();

    const handleClickToStart = (Number) => {
        navigate(`/quiz/${id}`, { state: { Number } });
    };

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/quizClass/imageUrl/${id}`)
            .then(response => response.json())
            .then(data => setQuizData(data))
            .catch(error => console.error('데이터 가져오기 실패:', error));
    }, [id]);

    return (
        <div>
            <div className="Navigate-Box">
                <Navigate />
            </div>

            <div className="Main-Box-QuizStartPage">
                <div className="Quiz-content-Box">
                    <div className="Quiz-image-Box">
                        <img
                            src={`${process.env.REACT_APP_API_URL}/${quizData}`}
                            alt="Quiz"
                            style={{ width: "100%", height: "auto" }}
                        />
                    </div>
                    <div className="Quiz-descript-Box">
                        <div className="Quiz-description">
                            00000 0 000 000 00 0 0 0 0 00 0 00000 0000 00 0 00 0 00 0 00 0 000 0 00000 0 0 00
                        </div>
                        <div className="Number-Button-Box">
                            <button className="Number-Button" onClick={() => handleClickToStart(10)}>10 문제</button>
                            <button className="Number-Button" onClick={() => handleClickToStart(20)} style={{ marginLeft: '40px' }}>20 문제</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizStartPage;
