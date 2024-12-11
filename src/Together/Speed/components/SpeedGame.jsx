import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { 
    connectWebSocket, 
    sendMessage, 
    setMessageHandler, 
    disconnectWebSocket, 
    subscribeToRoom, 
    unsubscribeFromRoom 
} from '../websocket/chatService';
import '../css/SpeedGame.css';
import Swal from 'sweetalert2';

function SpeedQuizGame() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = window.location.pathname;
    const gameId = pathname.split('/').pop();
    const { nickname, isHost, hostName } = location.state || {};

    const [gameState, setGameState] = useState('waiting');

    const [messages, setMessages] = useState([]);
    const [passUser, setPassUser] = useState(0);
    const [hasPassedCurrentQuestion, setHasPassedCurrentQuestion] = useState(false);
    const [passedPlayers, setPassedPlayers] = useState(new Set());
    const [game, setGame] = useState(null);
    const gameUseRef = useRef(null);
    const [countdown, setCountdown] = useState(null);



    const [redyStatus, setRedyStatus] = useState(false);

    const [showVotingUI, setShowVotingUI] = useState(false);
    const SpeedGameId = pathname.split('/').pop();

    const chatContainerRef = useRef(null);
    const client = useRef(null);

    const [answer, setAnswer] = useState(null);
    const quizUseRef = useRef(null);
    const currentTypingPlayerRef = useRef(null);
    const [currentTypingPlayer,setCurrentTypingPlayer] = useState(null);
    const [showTopNotification, setShowTopNotification] = useState(false);

    const [timeLeft, setTimeLeft] = useState(120); // 2분 = 120초
    const [answers, setAnswers] = useState({}); // answers 상태 초기화
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');

    useEffect(() => {
        // 투표 UI가 표시되면 자동으로 스크롤
        if (showVotingUI) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [showVotingUI]);

    useEffect(() => {
        let isSubscribed = true;

        const connectAndSetup = async () => {
            try {
                client.current = await connectWebSocket();
                console.log("게임 웹소켓 연결 성공");

                await subscribeToRoom(gameId);
                console.log(`게임 ${gameId} 구독 완료`);

                sendMessage('/app/speed_game.getSpeedQuizGame', {SpeedGameId : SpeedGameId });

                setMessageHandler((response) => {
                    if (!isSubscribed) return;
                    
                    console.log("게임 서버로부터 메시지 수신:", response);
                    
                    switch(response.type) {
                        case 'GET_GAME':
                            console.log("게임 정보 수신:", response.data);
                            quizUseRef.current = response.data.quizzes;
                            gameUseRef.current = response.data;
                            setGame(response.data);
                            break;
                        case 'SUBMIT_NO_ANSWER':
                            setAnswers(prev => ({
                            ...prev,
                            [response.data.sender]: response.data.content
                        }));

                            break;
                        case 'SUBMIT_ANSWER':
                            // 정답자가 있는 경우
                            console.log("정답자 있음");
                 
                            answerdQuizzed(response.data);
                            
                            break;
                        case 'PASS':
                            if(response.data === "READY"){
                                passIng();
                            }
                            else{
                                passEnd();

                            }
                   

                            break;
                        case 'VOTE':
                       

                            break;
                        case 'END_VOTE':
         
                            break;
                        case 'ANSWER':

                            break;
                        
                        case 'END_GAME':
              
     
                            break;
                        
                        case 'CHAT':
                 

                            break;
                    
                        case 'REMOVE':
                            console.log("resut : ", response.data.result);
                            if (response.data.result === true) {
                                // 게임 상태와 관련된 상태들을 초기화
                                setGameState('finished');
                                setGame(null);
             
                                
                                Swal.fire({
                                    title: `게임이 종료`,
                                    icon: 'success',
                                    confirmButtonText: '확인'
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                

                                        navigate('/liar');
                                    }
                                });
                            }
                            break;
                        case 'WORD_SUBMISSION':
                    
                            break;
                        default:
                            console.log("알 수 없는 메시지 타입:", response.type);
                    }
                });

            } catch (error) {
                console.error("게임 웹소켓 연결 실패:", error);
                alert("서버 연결에 실패했습니다. 로비로 이동합니다.");
                navigate('/liar');
            }
        };

        connectAndSetup();

        return () => {
            isSubscribed = false;
            unsubscribeFromRoom();
            disconnectWebSocket();
        };
    }, [gameId, navigate]);



  
   



    

   


    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (countdown === null || !game) return;

        const currentNickname = isHost ? hostName : nickname;
        
        if (countdown === 0) {
            setCountdown(null);
            // 카운트다운이 끝나면 제시어 팝업 표시
            Swal.fire({
                title: `게임 준비`,
                
                showConfirmButton: true,
                confirmButtonText: '게임 시작',
                allowOutsideClick: false,
                customClass: {
                    popup: 'word-popup',
                    title: 'word-title',
                    confirmButton: 'word-confirm-btn'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // 플레이어 순서를 랜덤하게 섞기
                    console.log("제시어 공개 해버림");
                    // setPlayerOrder(shuffledPlayers);
                    // setCurrentPlayerIndex(0);
                    startGame();
                }
            });
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, game, hostName, nickname, isHost]);

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        // 시간 종료 처리
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [gameState, timeLeft]);

    useEffect(() => {
        if (quizUseRef.current && quizUseRef.current.length > 0) {
            setCurrentQuestionIndex(0);
        }
    }, [quizUseRef.current]);

    useEffect(() => {
        setHasPassedCurrentQuestion(false);
        setPassedPlayers(new Set());
    }, [currentQuestionIndex]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startGame = () => {
        console.log("스타트 게임 옴");

        sendMessage('/app/game.startGame', {
            gameId: SpeedGameId, 
            
        });
            

    };
 


    const answerdQuizzed = (data) =>{
        console.log("정답자 있음2");
        const winnerId = data.winner;
        // 정답자 표시 및 다음 문제로 이동
        setAnswers(prev => ({
            ...prev,
            winner: winnerId
        }));
        
        // 정답 팝업 표시
        Swal.fire({
            title: '정답입니다! 🎉',
            text: `${winnerId}님이 정답을 맞추셨습니다!`,
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            background: '#fff',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            willClose: () => {
                // 팝업이 닫힐 때 다음 문제로 이동
                setCurrentQuestionIndex(prev => 
                    prev < quizUseRef.current.length - 1 ? prev + 1 : prev
                );
                // 답변 상태 초기화
                setAnswers({});
            }
        });
    }
    

   
    const handleSendChat = (event) => {
        if (event?.preventDefault) {
            event.preventDefault();
        }
        
        // 입력값이 비어있으면 리턴
        const answerText = currentAnswer.trim();
        console.log("제출할 답변:", answerText);
        if (!answerText) return;
        
        const players = gameUseRef.current?.players || {};
        const currentPlayer = Object.entries(players).find(([_, player]) => 
            player.nickname === (isHost ? hostName : nickname)
        );
        
        if (!currentPlayer) {
            console.error("현재 플레이어를 찾을 수 없습니다.");
            return;
        }

        const playerId = currentPlayer[0];
        console.log("보내는 사람 ID:", playerId);
        
        // 답변을 화면에 표시
        setAnswers(prev => {
            const newAnswers = {
                ...prev,
                [playerId]: answerText
            };
            console.log("업데이트된 답변 상태:", newAnswers);
            return newAnswers;
        });

        // 애니메이션 효과 적용
        const playerDesk = document.querySelector(`[data-player-id="${playerId}"]`);
        if (playerDesk) {
            playerDesk.style.transform = 'scale(1.05)';
            playerDesk.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
            setTimeout(() => {
                playerDesk.style.transform = '';
                playerDesk.style.boxShadow = '';
            }, 300);
        }

        // 서버로 답변 전송
        sendMessage('/app/speed_game.submit', {
            speedGameId: SpeedGameId,
            sender: playerId,
            answer: answerText,
            questionIndex: currentQuestionIndex
        });

        // 입력 필드 초기화
        setCurrentAnswer('');
    };

    const passIng = () => {
        setPassUser(prev => prev + 1);
        const currentPlayer = gameUseRef.current?.players?.find(
            player => player && player.nickname === (isHost ? hostName : nickname)
        );
        if (currentPlayer) {
            setPassedPlayers(prev => new Set([...prev, currentPlayer.nickname]));
        }
    }

    const passEnd = () => {
        Swal.fire({
            title: '다음문제로 넘어 갑니다.',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            background: '#fff',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            willClose: () => {
                setCurrentQuestionIndex(prev => 
                    prev < quizUseRef.current.length - 1 ? prev + 1 : prev
                );
                setAnswers({});
                setPassUser(0);
                setPassedPlayers(new Set());
            }
        });
    }

    const handlePass = () => {
        if (hasPassedCurrentQuestion || !gameUseRef.current?.players) return;
        
        console.log("Players 정보:", {
            players: gameUseRef.current.players,
            currentNickname: isHost ? hostName : nickname,
            isHost: isHost,
            hostName: hostName,
            nickname: nickname
        });

        const currentPlayer = gameUseRef.current.players.find(
            player => player && player.nickname === nickname
        );
        
        // console.log("패스버튼 누름 : ", {
        //     currentPlayer,
        //     canPass: currentPlayer ? true : false,
        //     reuslt : !passedPlayers.has(currentPlayer.nickname),
        //     nickname: isHost ? hostName : nickname,
        //     passedPlayers: Array.from(passedPlayers)
        // });

        console.log("패스 버튼 누른 플레이어 : ", nickname + "  " + passedPlayers.toString()) ;
        
        if (currentPlayer && !passedPlayers.has(currentPlayer.nickname)) {
            console.log("패스버튼 누름 22");
            setHasPassedCurrentQuestion(true);
            sendMessage('/app/speed_game.pass', {speedGameId : SpeedGameId});
        }

    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendChat(e);
        }
    };

    const handleSubmitAnswer = (e) => {
        handleSendChat(e);
    };

    const handleAnswerSubmission = (data) => {
        console.log('Answer received:', data);
        setAnswers(prev => ({
            ...prev,
            [data.sender]: data.answer
        }));
        
        // 정답 체크
        if (quizUseRef.current && quizUseRef.current[currentQuestionIndex]) {
            const correctAnswer = quizUseRef.current[currentQuestionIndex].answer;
            if (data.answer.toLowerCase() === correctAnswer.toLowerCase()) {
                // 정답 처리
                console.log('Correct answer!');
                // 다음 문제로 이동
                setCurrentQuestionIndex(prev => 
                    prev < quizUseRef.current.length - 1 ? prev + 1 : prev
                );
            }
        }
    };

    useEffect(() => {
        if (client.current?.connected) {
            // 답변 수신 구독
            const subscription = client.current.subscribe(
                `/topic/speed_game/${SpeedGameId}/answer`,
                (message) => {
                    const data = JSON.parse(message.body);
                    handleAnswerSubmission(data);
                }
            );

            return () => {
                subscription?.unsubscribe();
            };
        }
    }, [client.current?.connected]);

    const handleLeaveGame = () => {
        
        sendMessage('/app/game.leave', {gameId : SpeedGameId, nickname : nickname})
        
    };

    const handleAnswerChange = (e) => {
        setCurrentAnswer(e.target.value);
    };

    return (
        <div className="speed-quiz-container">
            <div className="speed-game-header">
                <button className="speed-exit-game-btn" onClick={handleLeaveGame}>
                    나가기
                </button>
                <div className="pass-status">
                    <div className="pass-count">
                        Pass : {passUser}/{gameUseRef.current?.players?.length || 0}
                    </div>
                    <div className="pass-progress">
                        <div 
                            className="pass-progress-bar" 
                            style={{
                                width: `${(passUser / (gameUseRef.current?.players?.length || 1)) * 100}%`
                            }}
                        />
                    </div>
                </div>
            </div>
            
            <div className="speed-game-content">
                <div className="speed-quiz-board">
                    <div className="speed-quiz-display">
                        <div className="speed-current-question">
                            {quizUseRef.current && quizUseRef.current[currentQuestionIndex] ? (
                                <div className="speed-quiz-item">
                                    <span className="speed-question-text">
                                        Q.{quizUseRef.current[currentQuestionIndex].question}
                                    </span>
                                </div>
                            ) : (
                                <div className="speed-loading-text">선생님의 문제를 기다리는 중...</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="speed-students-container">
                    {[...Array(Object.keys(gameUseRef.current?.players || {}).length)].map((_, index) => {
                        const players = gameUseRef.current?.players || {};
                        const playerEntries = Object.entries(players);
                        const player = playerEntries[index];
                        console.log("플레이어 정보:", player);
                        console.log("현재 답변들:", answers);

                        return (
                            <div 
                                key={player ? player[0] : index}
                                data-player-id={player ? player[0] : ''}
                                className={`speed-student-desk ${!player ? 'empty' : ''} ${
                                    player && currentTypingPlayer === player[0] ? 'typing' : ''
                                } ${player && answers?.winner === player[0] ? 'winner' : ''}`}
                                style={{ transition: 'all 0.3s ease' }}
                            >
                                {player ? (
                                    <div className="speed-student-content">
                                        <div className="speed-student-info">
                                            <div className="speed-student-avatar">
                                                {player[1].nickname.charAt(0)}
                                            </div>
                                            <span className="speed-student-name">
                                                {player[1].nickname}
                                            </span>
                                        </div>
                                        <div className="speed-student-score">
                                            점수: {player[1].score || 0}
                                        </div>
                                        {answers && answers[player[0]] && (
                                            <div className="speed-answer-bubble">
                                                {answers[player[0]]}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>

                <div className="speed-answer-section">
                    <input
                        type="text"
                        className="speed-answer-input"
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="답을 입력하세요..."
                    />
                    <button 
                        className={`speed-answer-submit ${hasPassedCurrentQuestion ? 'passed' : ''}`}
                        onClick={handleSubmitAnswer}
                    >
                        O
                    </button>
                    <button 
                        className={`speed-answer-submit ${hasPassedCurrentQuestion ? 'passed' : ''}`}
                        onClick={handlePass}
                        disabled={hasPassedCurrentQuestion}
                    >
                        {hasPassedCurrentQuestion ? 'Passed' : 'Pass'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SpeedQuizGame;
