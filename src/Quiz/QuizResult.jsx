import React, { useEffect, useState } from "react";
import Navigate from "../Navigate";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, ReferenceLine, YAxis, Label } from 'recharts';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import "./css/QuizResult.css";

const formatXAxisLabel = (answerNumber) => `${answerNumber}개`; 

function ResultChart() {  
    const location = useLocation();
    const { id } = useParams();
    const { answerNumber } = location.state || {};
    const highlight = answerNumber; 

    const [resultData, setResultData] = useState([]);
    const [topPercentage, setTopPercentage] = useState(0);

    useEffect(() => {
        fetch(`http://localhost:4000/api/quiz/results/${id}/${answerNumber}`)
          .then(response => response.json())
          .then(data => {
            setResultData(data.counts); 
            setTopPercentage(data.topPercentage);
            console.log('상위 퍼센트:', data.topPercentage);
        })  
          .catch(error => console.error('데이터 가져오기 실패:', error));
    }, [id,answerNumber]);

    const navigate = useNavigate();

    const handleClickToHome = () => {
        navigate('/quiz');
    };

    return (
        <div style={{ marginTop: '30px' }}>
            <h3>당신의 평균</h3>
            <ResponsiveContainer width={1500} height={400}>
                <LineChart data={resultData}>
                    <Line type="monotone" dataKey="count" stroke="#2D8CFF" strokeWidth={2} dot={{ r: 4 }} />
                    
           
                    <ReferenceLine x={highlight} stroke="red" strokeDasharray="3 3">
                        <Label value="나" position="top" offset={-10} fill="black" />
                    </ReferenceLine>

                    <XAxis
                        dataKey="answerNumber"
                        height={40}
                        tickFormatter={formatXAxisLabel}
                        tickMargin={10}
                        tickLine={false}
                        padding={{ left: 13, right: 13 }}
                    />
                    <YAxis />
                    <Tooltip />
                </LineChart>
            </ResponsiveContainer>

            <div className="result-Description-Box">
                <div className="result-Description">당신은 상위 {topPercentage}% 입니다</div>
            </div>

            <div className="Button-Box">
                <button className="Home-Button" onClick={handleClickToHome}>Home</button>
            </div>
        </div>
    );
}

function QuizResult() {
    return (
        <div>
            <div className="Navigate-Box">
                <Navigate />
            </div>

            <div className="Chart-Box2">
                <ResultChart />
            </div>
        </div>
    );
}

export default QuizResult;
