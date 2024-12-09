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

function SpeedGame() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = window.location.pathname;
    const gameId = pathname.split('/').pop();
    const { nickname, isHost, hostName } = location.state || {};

    const [gameState, setGameState] = useState('waiting');

    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [game, setGame] = useState(null);
    const gameUseRef = useRef(null);
    const [countdown, setCountdown] = useState(null);

    const [playerOrder, setPlayerOrder] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playerDescriptions, setPlayerDescriptions] = useState({});

    const [redyStatus, setRedyStatus] = useState(false);

    const [showVotingUI, setShowVotingUI] = useState(false);
    const SpeedGameId = pathname.split('/').pop();

    const chatContainerRef = useRef(null);
    const client = useRef(null);

    const [selectedVote, setSelectedVote] = useState(null);
    const gameResult = useRef(null);
    const currentTypingPlayerRef = useRef(null);
    const [currentTypingPlayer,setCurrentTypingPlayer] = useState(null);
    const [showTopNotification, setShowTopNotification] = useState(false);

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
                            break;
                        case 'NEW_TURN':
                           
                            break;
                        case 'GAME_START':
                            console.log("게임 스타트");
       
                            break;
                        case 'PLAYER_READY':
                   
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
                                setPlayerOrder([]); // playerOrder를 빈 배열로 초기화
                                
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
                            handleWordSubmission(response.data);
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
                title: `제시어 공개
                <div class="round">round ${gameUseRef.current.round}</div>`,
                html: `
                
                    <div class="word-reveal">
                        <div class="word-category">${game.category}</div>
                        <div class="word-text">${game.liar?.nickname === currentNickname ? '당신은 라이어입니다!' : `제시어: ${gameUseRef.current.keywords?.[gameUseRef.current.currentRound-1]}`}</div>
                    </div>
                `,
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

   

 

  

    

    const startGame = () => {
        console.log("스타트 게임 옴");

        sendMessage('/app/game.startGame', {
            gameId: SpeedGameId, 
            
        });
            

    };




    

   

    const handleWordSubmission = (data) => {
        // 먼저 설명을 업데이트
        setPlayerDescriptions(prev => ({
            ...prev,
            [data.player]: data.description
        }));
        
        // 타이핑 상태는 즉시 제거하지 않고 약간의 지연 후 제거
        setTimeout(() => {
            currentTypingPlayerRef.current = null;
        }, 100); // 짧은 지연 시간 설정
    };

    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        console.log("nickname : ", nickname);
        console.log("isHost : ", isHost);
        const senderNickname = isHost ? hostName : nickname;
        
        
        setChatInput('');
    };

    const handleLeaveGame = () => {
        
        sendMessage('/app/game.leave', {gameId : SpeedGameId, nickname : nickname})
        
    };

  



    
    

    
    return (
        <div className="liar-game">
            {showTopNotification && currentTypingPlayerRef.current && (
                <div className="top-notification">
                    {currentTypingPlayerRef.current}님이 설명중입니다...
                </div>
            )}
            <div className="game-header">
                {showVotingUI && (
                    <div className="voting-instruction">
                        {selectedVote ? `${selectedVote}님을 라이어로 지목했습니다` : '라이어를 선택해주세요'}
                    </div>
                )}
            
                <button className="leave-button" onClick={handleLeaveGame}>
                    나가기
                </button>
            </div>

            {countdown !== null && (
                <div className="countdown-overlay">
                    <div className="countdown-number">{countdown}</div>
                </div>
            )}

            <div className="game-content">
                <div className="players-section">
                    {[...Array(6)].map((_, index) => {
                        const player = game?.players[index];
                        const playerIndex = playerOrder?.findIndex(p => p === player?.nickname) ?? -1;
                        const isCurrentPlayer = gameState === 'playing' && playerIndex === currentPlayerIndex;
                        const description = player ? playerDescriptions[player.nickname] : null;
                        const isVoted = selectedVote === player?.nickname;
                        
                        return player ? (
                            <div key={index} className={`player-card ${currentTypingPlayerRef.current === player.nickname ? 'typing' : ''}`}>
                               
                                <div className="player-info">
                                    <div className="player-status">
                                        {player.nickname}
                                        {isVoted && <span className="vote-indicator">✓</span>}
                                    </div>
                                    {isCurrentPlayer && (
                                        <div className="current-turn-indicator">
                                            <div className="indicator-dot"></div>
                                            현재 차례
                                        </div>
                                    )}
                                    {currentTypingPlayerRef.current === player.nickname && (
                                        <div className="typing-indicator">
                                            입력중
                                            <div className="typing-dot"></div>
                                            <div className="typing-dot"></div>
                                            <div className="typing-dot"></div>
                                        </div>
                                    )}
                                </div>
                                {currentTypingPlayerRef.current === player.nickname && currentTypingPlayerRef ? (
                                    <div className="typing-indicator">
                                        입력중
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                    </div>
                                ) : playerDescriptions[player.nickname] && (
                                    <div className={`description-bubble ${index % 2 === 0 ? 'right' : 'left'}`}>
                                        {playerDescriptions[player.nickname]}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div key={index} className="player-card empty">
                                <div className="player-avatar empty">?</div>
                                <div className="player-info">
                                    <div className="player-name">빈 자리</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="chat-section">
                    <div className="chat-messages" ref={chatContainerRef}>
                        {messages.map((msg, index) => (
                            <div
                            key={index}
                            className={`message ${msg.sender === (isHost ? hostName : nickname) ? 'my-message' : ''}`}
                        >
                            <strong>{msg.sender}: </strong>
                            <span className="messageContent">{msg.content}</span>
                        </div>
                        ))}
                    </div>
                    <div className="chat-input2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                            placeholder="메시지를 입력하세요..."
                        />
                        <button onClick={handleSendChat}>전송</button>
                    </div>
                </div>
            </div>
           
        </div>
    );
}

export default SpeedGame;
