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
import '../css/LiarGame.css';
import Swal from 'sweetalert2';

function LiarGame() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = window.location.pathname;
    const gameId = pathname.split('/').pop();
    const { nickname, isHost, hostName } = location.state || {};

    const [gameState, setGameState] = useState('waiting');
    const [players, setPlayers] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(1);
    const [word, setWord] = useState('');
    const [category, setCategory] = useState('');
    const [timer, setTimer] = useState(0);
    const [isLiar, setIsLiar] = useState(false);
    const [votes, setVotes] = useState({});
    const [playerNum, setPlayerNum] = useState(0);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [game, setGame] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [currentRound, setCurrentRound] = useState(1);
    const [playerOrder, setPlayerOrder] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playerDescriptions, setPlayerDescriptions] = useState({});
    const [turnCount, setTurnCount] = useState(0);
    const [turnTime, setTurnTime] = useState(0); 
    const [redyNum, setRedyNum] = useState(0);
    const [removeStatus, setRemoveStatus] = useState(false);
    const [redyStatus, setRedyStatus] = useState(false);
    const [currentTurnRound, setCurrentTurnRound] = useState(1); // 현재 턴 라운드 추가
    const [showVotingUI, setShowVotingUI] = useState(false);
    const LiarGameId = pathname.split('/').pop();
    const turnRef = useRef(1);
    const turnStatus = useRef(false);
    const isTurnEnd = useRef(false);
    const chatContainerRef = useRef(null);
    const client = useRef(null);
    const [selectedVote, setSelectedVote] = useState(null);

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

                sendMessage('/app/game.getLiarGame', {LiarGameId : LiarGameId });

                setMessageHandler((response) => {
                    if (!isSubscribed) return;
                    
                    console.log("게임 서버로부터 메시지 수신:", response);
                    
                    switch(response.type) {
                        case 'GET_GAME':
                            console.log("게임 정보 수신:", response.data);
                            setGame(response.data);
                            setCountdown(3);
                            break;
                        case 'NEW_TURN':
                            console.log("NEW- turn");
                            console.log("뉴 턴 데이터 : ",response.data);
                            turnUpdateStau(response.data);
                            break;
                        case 'GAME_START':
                            console.log("게임 스타트");
                            handleGameStart(response.data);
                            break;
                        case 'PLAYER_READY':
                            handleRedyStatus(response.data);
                            break;
                        case 'TURN_CHANGE':
                            handleTurnChange(response.data);
                            break;
                        case 'WORD_REVEAL':
                            handleWordReveal(response.data);
                            break;
                        case 'VOTE_UPDATE':
                            handleVoteUpdate(response.data);
                            break;
                        case 'GAME_RESULT':
                            handleGameResult(response.data);
                            break;
                  
                        
                        case 'CHAT':
                            console.log("채팅 메시지 수신:", response);
                            setMessages(prev => [...prev, response.data]);
                            break;
                        case 'ERROR':
                            handleError(response.data);
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

    // useEffect(()=>{
    //     console.log("유즈 이벡트 커런트 턴 : ", currentTurn);
    // },[currentTurn]);

    const turnUpdateStau = (data) => {
        console.log("321");
        if(data.currentPlayer === null){
            endCurrentTurnRound();
            return;
        }
        
        console.log('Turn update received:', data);
        setCurrentPlayerIndex(0);

        if(data.isTurnEnd){
            Swal.fire({
                title: `종료!`,
                text: '라이어를 찾아주세요!',
                icon: 'info',
                confirmButtonText: '확인',
                showConfirmButton: true,    
                allowOutsideClick: false,
                didOpen: () => {
                    // 알림창이 열릴 때 투표 UI 준비
                    isTurnEnd.current = true;
                }
            }).then((result) => {
                if (result.isConfirmed) { 
                      turnEnd();
                    }
                }
            )

            return;


        }

        
        if(data.turn){
            console.log("!123");
            turnRef.current = data.turn;
        
  
        
            try {
                console.log("Attempting to show Swal for turn:", data.turn);
      
                
                Swal.fire({
                    title: `${turnRef.current}번째 턴 시작!`,
                    text: '이번에도 설명을 잘 해주세요!',
                    icon: 'info',
                    confirmButtonText: '확인',
                    showConfirmButton: true,    
                    allowOutsideClick: false,
                    didOpen: () => {
                        console.log("SweetAlert opened");
                    }
                }).then((result) => {
                    if (result.isConfirmed) { 
                        turnStatus.current = false;
                        setCurrentTurn(turnRef.current);  
                        handleTurnUpdate(data);
                    }
                }).catch((error) => {
                    console.error("Error in Swal:", error);
                });
            } catch (error) {
                console.error("Error showing Swal:", error);
            }
        } else {
            handleTurnUpdate(data);
        }
    };

    const handleTurnUpdate = (data) => {
        
            
        const currentNickname = isHost ? hostName : nickname;
        console.log('Current player:', data.currentPlayer, 'My nickname:', currentNickname);
        
        
            if (data.currentPlayer === currentNickname) {
                Swal.fire({
                    title: '제시어 설명',
                    text: '당신의 차례입니다. 제시어에 대한 설명을 입력하세요.',
                    input: 'text',
                    inputPlaceholder: '제시어에 대한 설명을 입력하세요...',
                    showCancelButton: false,
                    allowOutsideClick: false,
                    confirmButtonText: '제출',
                    customClass: {
                        popup: 'word-popup',
                        title: 'word-title',
                        input: 'word-input',
                        confirmButton: 'word-confirm-btn'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        setTurnCount(pre=>pre+1);
                        sendMessage('/app/game.submitWord', {gameId : LiarGameId, player : currentNickname, description : result.value});

                        
                    }
                });
            } else {
                Swal.fire({
                    title: '다른 플레이어 차례',
                    text: `${data.currentPlayer}님이 설명중입니다...`,
                    showConfirmButton: false,
                    timer: 2000,
                    customClass: {
                        popup: 'turn-notification-popup'
                    }
                });
            }
        
    
    };

    const handleMessage = (message) => {
        const response = JSON.parse(message.body);
        console.log('Received message:', response); // 디버깅용 로그
        
        switch(response.type) {
            case 'PLAYER_READY':
                handleRedyStatus(response.data);
                break;
            // case 'NEW_TURN':
            //     handleTurnUpdate(response.data);
            //     break;
            case 'START_GAME':
            case 'TURN_UPDATE':
                console.log("QQQQQQQ");
                turnUpdateStau(response.data);
                break;
        
            case 'GET_GAME':
                setGame(response.data);
                break;
            case 'REMOVE':
                console.log("resut : " ,response.data.result )
                if(response.data.result === true){
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
            case 'PLAYER_ORDER':
                setPlayerOrder(response.data.players);
                break;
            default:
                console.log('Unhandled message type:', response.type);
                break;
        }
    };

    useEffect(() => {
        if (client.current && game) {
            const subscription = client.current.subscribe(`/topic/game/${LiarGameId}`, handleMessage);
            return () => subscription.unsubscribe();
        }
    }, [client, game, LiarGameId]);

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
                <div class="round">round ${currentRound}</div>`,
                html: `
                
                    <div class="word-reveal">
                        <div class="word-category">${game.category}</div>
                        <div class="word-text">${game.liar?.nickname === currentNickname ? '당신은 라이어입니다!' : `제시어: ${game.keywords?.[currentRound-1]}`}</div>
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

    const startTurn = () => {
        if (currentTurn > game.turnTime) {
            // 모든 턴이 끝났을 때의 처리
            endRound();
            return;
        }

        // 현재 턴의 플레이어 표시
        const currentPlayer = playerOrder[0];
        
        // 턴 타이머 시작 (30초)
        let timeLeft = 30;
        const turnTimer = setInterval(() => {
            timeLeft--;
            setTimer(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(turnTimer);
                nextPlayer();
            }
        }, 1000);
    };

    const nextPlayer = () => {
        if (turnCount === playerOrder.length - 1) {
            // 모든 플레이어가 턴을 마쳤으면 다음 턴으로
            console.log("!!!@#!#!@#!@#");
            setCurrentPlayerIndex(0);
            startTurn();
        } else {
            // 다음 플레이어로
            setCurrentPlayerIndex(prev => prev + 1);
            startTurn();
        }
    };

    const endRound = () => {
        // 라운드 종료 처리
        if (currentRound < game.rounds) {
            setCurrentRound(prev => prev + 1);
            setCountdown(3); // 다음 라운드 시작
        } else {
            // 게임 종료
            setGameState('finished');
        }
    };

    const handleGameStart = (data) => {
        console.log('Game start data:', data);
        setGameState('playing');
        setPlayerOrder(data.playerOrder || []);
        setPlayerNum(data.playerOrder.length);
        setCurrentPlayerIndex(0);
        setTurnTime(data.turnTime || 1); // turnTime 설정
        setCurrentRound(game.currentRound) // 첫 턴 라운드 설정
        startTurn();
    };

    const handleTurnChange = (data) => {
        setTimer(data.timeLeft);
    };

    const handleWordReveal = (data) => {
        setWord(data.word);
    };

    const handleVoteUpdate = (data) => {
        setVotes(data.votes);
    };

    const handleGameResult = (data) => {
        setGameState('result');
     
    };

    const handleChat = (data) => {
        setMessages(prev => [...prev, data]);
    };

    const handleError = (data) => {
        alert(data.message);
    };

    const startGame = () => {
        console.log("스타트 게임 옴");

        sendMessage('/app/game.startGame', {
            gameId: LiarGameId, 
            
        });
            

    };


    const endCurrentTurnRound = () => {
        console.log("커런트 턴 : ", currentTurn);
        setGameState('turnEnd');
        Swal.fire({
            title: `${turnRef.current}번째 턴 종료!`,
            text: '다음 턴을 시작하려면 준비 완료 버튼을 눌러주세요.',
            icon: 'success',
            confirmButtonText: '확인'
        }).then((result) => {
            if (result.isConfirmed) {
        
                setRedyStatus(true);
            }
        });
        
    };

    

    const turnEnd = () => {
        isTurnEnd.current = true;
        setShowVotingUI(true); // 투표 UI 표시
        console.log("현재 턴 종료 : ", isTurnEnd.current);
    }

    const handleRedy = () =>{
        setRedyStatus(false);
        Swal.fire({
            title: `준비 완료`,
            icon: 'success',
            timer: 500,
            showConfirmButton: false
        });

        sendMessage('/app/game.ready', {
            gameId: LiarGameId, 
            nickname : nickname
            
        });

    }
    const handleRedyStatus = (data) =>{
        console.log("핸들레디 스태터스 : ", data.redyStatus);
        if(data.readyStatus){
                console.log("준비완료");
                startNextTurnRound();
         
        
        }

    }

    const startNextTurnRound = () => {
        console.log("다음 턴 준비");
        setCurrentPlayerIndex(0);
        setGameState('playing');
        turnStatus.current = true;

        // sendMessage('/app/game.newTurn', {
        //     gameId: LiarGameId, 
            
        // });

        sendMessage('/app/game.newTurn', {
            gameId: LiarGameId,
            
        });
         
        
    };

    const handleWordSubmission = (data) => {
        setPlayerDescriptions(prev => ({
            ...prev,
            [data.player]: data.description
        }));
    };

    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        console.log("nickname : ", nickname);
        console.log("isHost : ", isHost);
        const senderNickname = isHost ? hostName : nickname;
        
        sendMessage('/app/game.chatGame', {
            gameId: gameId,
            content: chatInput,
            sender: senderNickname
        });
        setChatInput('');
    };

    const handleLeaveGame = () => {
        
        sendMessage('/app/game.leave', {gameId : LiarGameId, nickname : nickname})
        
    };

    const handleVoteClick = (playerNickname) => {
        if (!isTurnEnd.current) return;
        
        // 이미 같은 플레이어를 선택했다면 선택 취소
        if (selectedVote === playerNickname) {
            setSelectedVote(null);
            return;
        }
        
        setSelectedVote(playerNickname);
        
        // 투표 처리 로직
        client.current.send('/pub/game/vote', {}, JSON.stringify({
            roomId: LiarGameId,
            voter: nickname,
            votedPlayer: playerNickname
        }));
    };

    return (
        <div className="liar-game">
            <div className="game-header">
                {showVotingUI && (
                    <div className="voting-instruction">
                        {selectedVote ? `${selectedVote}님을 라이어로 지목했습니다` : '라이어를 선택해주세요'}
                    </div>
                )}
                {redyStatus && (
                    <button 
                        className="redy-button"
                        onClick={handleRedy}
                    >
                        다음 턴 시작
                    </button>
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
                            <div key={index} className="player-card">
                                <div 
                                    className={`player-avatar ${isCurrentPlayer ? 'current-turn' : ''} 
                                              ${showVotingUI ? 'votable' : ''} 
                                              ${isVoted ? 'voted' : ''}`}
                                    onClick={() => showVotingUI && handleVoteClick(player.nickname)}
                                >
                                    {player.nickname.charAt(0).toUpperCase()}
                                    {playerIndex !== -1 && (
                                        <div className="player-order-badge">{playerIndex + 1}</div>
                                    )}
                                </div>
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
                                </div>
                                {description && (
                                    <div className={`word-bubble ${index < 3 ? 'right' : 'left'}`}>
                                        {description}
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

export default LiarGame;