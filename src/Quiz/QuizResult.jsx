import React, { useEffect, useState } from "react";
import Navigate from "../Navigate";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, ReferenceLine, YAxis, Label, CartesianGrid, Legend, Area, AreaChart } from 'recharts';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import "./css/QuizResult.css";

const formatXAxisLabel = (answerNumber) => `${answerNumber}문제`; 

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p style={{ color: '#666' }}>{`정답 개수: ${label}문제`}</p>
                <p style={{ color: '#2D8CFF', fontWeight: 'bold' }}>
                    {`응답자 수: ${payload[0].value}명`}
                </p>
            </div>
        );
    }
    return null;
};

function ResultChart() {  
    const location = useLocation();
    const { id } = useParams();
    const { answerNumber } = location.state || {};
    const highlight = answerNumber; 

    const [resultData, setResultData] = useState([]);
    const [topPercentage, setTopPercentage] = useState(0);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/quiz/results/${id}/${answerNumber}`)
          .then(response => response.json())
          .then(data => {
            setResultData(data.counts); 
            setTopPercentage(data.topPercentage);
        })  
          .catch(error => console.error('데이터 가져오기 실패:', error));
    }, [id, answerNumber]);

    const navigate = useNavigate();

    const handleClickToHome = () => {
        navigate('/quiz');
    };

    return (
        <div className="chart-container">
            <h2 className="chart-title">퀴즈 결과 분포도</h2>
            
            <div style={{ width: '100%', height: '400px', marginBottom: '2rem' }}>
                <ResponsiveContainer>
                    <AreaChart 
                        data={resultData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2D8CFF" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#2D8CFF" stopOpacity={0.2}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="#f0f0f0" 
                            vertical={false}
                        />
                        <XAxis
                            dataKey="answerNumber"
                            height={60}
                            tickFormatter={formatXAxisLabel}
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickMargin={10}
                            tickLine={false}
                            padding={{ left: 30, right: 30 }}
                        >
                            <Label 
                                value="정답 개수" 
                                position="bottom" 
                                offset={20} 
                                fill="#666"
                                style={{ fontFamily: 'Pretendard' }}
                            />
                        </XAxis>
                        <YAxis
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            width={60}
                        >
                            <Label 
                                value="응답자 수" 
                                angle={-90} 
                                position="insideLeft" 
                                offset={-10} 
                                fill="#666"
                                style={{ fontFamily: 'Pretendard' }}
                            />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#2D8CFF"
                            strokeWidth={3}
                            fill="url(#splitColor)"
                            dot={{ r: 4, fill: '#2D8CFF', strokeWidth: 2 }}
                            activeDot={{ 
                                r: 6, 
                                fill: '#2D8CFF', 
                                stroke: '#fff', 
                                strokeWidth: 2,
                                className: 'animated-dot'
                            }}
                        />
                        <ReferenceLine
                            x={highlight}
                            stroke="#FF4B4B"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{
                                value: '내 점수',
                                position: 'top',
                                fill: '#FF4B4B',
                                fontSize: 14,
                                fontWeight: 'bold',
                                fontFamily: 'Pretendard'
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="result-Description-Box">
                <div className="result-Description">
                    축하합니다! 상위 {topPercentage}% 의 성적입니다
                </div>
            </div>

            <div className="Button-Box">
                <button 
                    className="Home-Button"
                    onClick={handleClickToHome}
                >
                    홈으로 돌아가기
                </button>
            </div>
        </div>
    );
}

function QuizResult() {
    return (
        <div className="Chart-Box">
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
