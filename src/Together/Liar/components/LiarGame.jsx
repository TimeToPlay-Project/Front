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
import liarIcon from '../assets/liar-icon.svg';
import image from '../assets/image.png';

function LiarGame() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = window.location.pathname;
    const gameId = pathname.split('/').pop();
    const { nickname, isHost, hostName } = location.state || {};

    const [gameState, setGameState] = useState('waiting');
    const [readyPlayers, setReadyPlayers] = useState(0);
    const readyStatusRef = useRef(0);
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
    const gameUseRef = useRef(null);
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
    const voteStatus = useRef(false);
    const voteResult = useRef(null);
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

                sendMessage('/app/game.getLiarGame', {LiarGameId : LiarGameId });

                setMessageHandler((response) => {
                    if (!isSubscribed) return;
                    
                    console.log("게임 서버로부터 메시지 수신:", response);
                    
                    switch(response.type) {
                        case 'GET_GAME':
                            console.log("게임 정보 수신:", response.data);
                            setGame(response.data);
                            gameUseRef.current=response.data;
                            setCountdown(3);
                            break;
                        case 'NEW_TURN':
                            console.log("NEW- turn");
                            console.log("뉴 턴 데이터 : ",response.data);

                            if(response.data.readyStatus === "success"){
                                console.log("앜앜앜앜앜ㅇ");
                                setReadyPlayers(prev=>prev +1);
                                readyStatusRef.current = readyStatusRef.current+1;
                            }
                            else{
                                turnUpdateStausNewTurn(response.data);
                            }
                         
                            break;
                        case 'GAME_START':
                            console.log("게임 스타트");
       
                            break;
                        case 'PLAYER_READY':
                            handleRedyStatus(response.data);
                            setReadyPlayers(prev=>prev +1);
                            break;
                        case 'VOTE':
                            if(response.data.status === "OK"){
                                return;
                            }
                            break;
                        case 'END_VOTE':
                            endVote(response.data);
                            break;
                        case 'ANSWER':
                            voteAnswerResult(response.data);
                            break;
                        
                        case 'END_GAME':
                            gameResult.current = response.data;
                            endGame();
                            break;
                        
                        case 'CHAT':
                            console.log("채팅 메시지 수신:", response);
                            setMessages(prev => [...prev, response.data]);
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



    const turnUpdateStaus = (data) => {
        console.log("321");

        if(data.isTurnEnd){
            currentTypingPlayerRef.current = null;
            setCurrentTypingPlayer(null);
            setGameState('turnEnd');
            Swal.fire({
                title: `<div class="popup-title">
                            <div class="turn-number">${turnRef.current}번째 턴</div>
                            <div class="turn-status">종료!</div>
                        </div>`,
                html: `<div class="popup-content">
                        <div class="popup-message">다음 턴을 시작하려면</div>
                        <div class="popup-highlight">준비 완료</div>
                        <div class="popup-message">버튼을 눌러주세요</div>
                       </div>`,
                showConfirmButton: true,
                confirmButtonText: '확인',
                allowOutsideClick: false,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                showClass: {
                    popup: 'animate__animated animate__fadeIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOut'
                },
                customClass: {
                    container: 'popup-container',
                    popup: 'custom-popup',
                    title: 'popup-title-class',
                    confirmButton: 'popup-confirm-button',
                    htmlContainer: 'popup-content-container'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                      turnEnd();
                    }
                }
            )

            return;


        }

        if(data.currentPlayer === null){
            endCurrentTurnRound();
            return;
        }
        
        console.log('Turn update received:', data);
        setCurrentPlayerIndex(0);


        handleTurnUpdate(data);
       
    };



    const turnUpdateStausNewTurn = (data) => {
        


        if(data.currentPlayer === null){
            endCurrentTurnRound();
            return;
        }
        
        console.log('Turn update received:', data);
        setCurrentPlayerIndex(0);

        

        
        if(data.turn){
            console.log("!123");
            turnRef.current = data.turn;
        
  
        
            try {
                console.log("Attempting to show Swal for turn:", data.turn);
                setReadyPlayers(0);
                
                Swal.fire({
                    title: `<div class="popup-title">
                                <div class="turn-icon">🎲</div>
                                <div class="turn-number">${turnRef.current}번째 턴 시작!</div>
                           </div>`,
                    html: `<div class="popup-content">
                            <div class="popup-message">
                                <div class="turn-main">새로운 턴이 시작됩니다</div>
                                <div class="turn-sub">이번에도 설명을 잘 해주세요!</div>
                            </div>
                           </div>`,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    confirmButtonText: '확인',
                    showConfirmButton: true,    
                    allowOutsideClick: false,
                    showClass: {
                        popup: 'animate__animated animate__fadeIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut'
                    },
                    customClass: {
                        container: 'popup-container',
                        popup: 'custom-popup turn-popup',
                        title: 'popup-title-class',
                        confirmButton: 'turn-confirm-button',
                        htmlContainer: 'popup-content-container'
                    }
                }).then((result) => {
                    if (result.isConfirmed) { 
                        turnStatus.current = false;
                        setCurrentTurn(turnRef.current);  
                        handleTurnUpdateNewTurn(data);
                    }
                }).catch((error) => {
                    console.error("Error in Swal:", error);
                });
            } catch (error) {
                console.error("Error showing Swal:", error);
            }
        } else {
            handleTurnUpdateNewTurn(data);
        }
    };


    const handleTurnUpdateNewTurn = (data) => {
        
        setReadyPlayers(0);
        const currentNickname = isHost ? hostName : nickname;
        console.log('Current player:', data.currentPlayer, 'My nickname:', currentNickname);
        
        
            if (data.currentPlayer === currentNickname) {
                Swal.fire({
                    title: `<div class="popup-title">
                                
                            ${gameUseRef.current.liar?.nickname === currentNickname ? 
                                
                               `
                               <img src="${image}" class="liar-icon" alt="Liar Icon"/>
                                <div class="liar-text">당신은 라이어입니다!</div>`
                               : 
                               `<div class="answer-icon">🎯</div>
                                <div class="answer-text">정답 입력</div>
                                <div class="answer-text">제시어 : ${gameUseRef.current.keywords?.[gameUseRef.current.currentRound-1]}</div>`
                                }
                                
                           </div>`,

                    html: `<div class="popup-content">
                            <div class="answer-message">
                                <div class="answer-main">제시어를 맞춰보세요!</div>
                                ${gameUseRef.current.liar?.nickname === currentNickname ? 
                                `<div class="word-category2">${gameUseRef.current.category}</div>`:
                                ``}
                                <div class="answer-sub">라이어는 제시어를 추측하여 입력해주세요</div>
                            </div>
                           </div>`,
                    input: 'text',
                    inputPlaceholder: '정답을 입력하세요...',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    showCancelButton: true,
                    confirmButtonText: '제출',
                    cancelButtonText: '취소',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut'
                    },
                    customClass: {
                        container: 'popup-container',
                        popup: 'custom-popup answer-popup',
                        input: 'answer-input',
                        confirmButton: 'answer-confirm-button',
                        cancelButton: 'answer-cancel-button',
                        title: 'popup-title-class',
                        htmlContainer: 'popup-content-container'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        setTurnCount(pre=>pre+1);
                        currentTypingPlayerRef.current = currentNickname;
                        sendMessage('/app/game.submitWord', {gameId : LiarGameId, player : currentNickname, description : result.value});

                        
                    }
                });
            } else {
                setShowTopNotification(true);
                currentTypingPlayerRef.current = data.currentPlayer;
                setCurrentTypingPlayer(currentTypingPlayerRef.current);
                
             
            }
        
    
    };



    const handleTurnUpdate = (data) => {
        setReadyPlayers(0);
            
        const currentNickname = isHost ? hostName : nickname;
        console.log('Current player:', data.currentPlayer, 'My nickname:', currentNickname);
        
        
            if (data.currentPlayer === currentNickname) {

                Swal.fire({
                    title: `<div class="popup-title">
                                
                            ${gameUseRef.current.liar?.nickname === currentNickname ? 
                                
                               `
                               <img src="${image}" class="liar-icon" alt="Liar Icon"/>
                                <div class="liar-text">당신은 라이어입니다!</div>`
                               : 
                               `<div class="answer-icon">🎯</div>
                                <div class="answer-text">정답 입력</div>
                                <div class="answer-text">제시어 : ${gameUseRef.current.keywords?.[gameUseRef.current.currentRound-1]}</div>`
                                }
                                
                           </div>`,

                    html: `<div class="popup-content">
                            <div class="answer-message">
                                <div class="answer-main">제시어를 맞춰보세요!</div>
                                ${gameUseRef.current.liar?.nickname === currentNickname ? 
                                `<div class="word-category2">${gameUseRef.current.category}</div>`:
                                ``}
                                <div class="answer-sub">라이어는 제시어를 추측하여 입력해주세요</div>
                            </div>
                           </div>`,
                    input: 'text',
                    inputPlaceholder: '정답을 입력하세요...',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    showCancelButton: true,
                    confirmButtonText: '제출',
                    cancelButtonText: '취소',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut'
                    },
                    customClass: {
                        container: 'popup-container',
                        popup: 'custom-popup answer-popup',
                        input: 'answer-input',
                        confirmButton: 'answer-confirm-button',
                        cancelButton: 'answer-cancel-button',
                        title: 'popup-title-class',
                        htmlContainer: 'popup-content-container'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        setTurnCount(pre=>pre+1);
                        currentTypingPlayerRef.current = currentNickname;
                        sendMessage('/app/game.submitWord', {gameId : LiarGameId, player : currentNickname, description : result.value});

                        
                    }
                });
            } else {
                setShowTopNotification(true);
                currentTypingPlayerRef.current = data.currentPlayer;
                setCurrentTypingPlayer(currentTypingPlayerRef.current);
               
            }
        
    
    };

    const handleMessage = (message) => {
        const response = JSON.parse(message.body);
        console.log('Received message:', response); // 디버깅용 로그
        
        switch(response.type) {
            // case 'PLAYER_READY':
            //     handleRedyStatus(response.data);
            //     break;
            // case 'NEW_TURN':
            //     handleTurnUpdate(response.data);
            //     break;
            case 'START_GAME':
            case 'NEW_TURN':
                        console.log("NEW- turn");
                        console.log("뉴 턴 데이터 : ",response.data);

                        if(response.data.readyStatus === "success"){
                            console.log("앜앜앜앜앜ㅇ2");
                            setReadyPlayers(prev=>prev +1);
                            readyStatusRef.current = readyStatusRef.current+1;
                        }
                        else{
                            turnUpdateStausNewTurn(response.data);
                        }
                        
                        break;
              
            case 'ROUND_UPDATE':
                console.log("QQQQQQQ");
                setGame(response.data.game);
                gameUseRef.current=response.data.game;
                // turnUpdateStaus(response.data);
                turnRef.current = response.data.game.currentTurn;
                setCountdown(3);
                break;
        
            case 'TURN_UPDATE':
                console.log("QQQQQQQ");
                turnUpdateStaus(response.data);
                break;
        
            case 'GET_GAME':
                setGame(response.data);
                break;
            case 'REMOVE':
                console.log("resut : " ,response.data.result )
                if(response.data.result){
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
                <div class="round">round ${gameUseRef.current.round}</div>`,
                html: `
                
                    <div class="word-reveal">
                        <div class="word-category">${gameUseRef.current.category}</div>
                        <div class="word-text">${gameUseRef.current.liar?.nickname === currentNickname ? `당신은 <br> 라이어입니다!` : `제시어: ${gameUseRef.current.keywords?.[gameUseRef.current.currentRound-1]}`}</div>
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
                    setReadyPlayers(prev=>prev+1);
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
            gameId: LiarGameId, 
            
        });
            

    };


    const endCurrentTurnRound = () => {
        console.log("커런트 턴 : ", currentTurn);
        currentTypingPlayerRef.current = null;
        setCurrentTypingPlayer(null);
        setGameState('turnEnd');
        Swal.fire({
            title: `<div class="popup-title">
                        <div class="turn-number">${turnRef.current}번째 턴</div>
                        <div class="turn-status">종료!</div>
                    </div>`,
            html: `<div class="popup-content">
                    <div class="popup-message">다음 턴을 시작하려면</div>
                    <div class="popup-highlight">준비 완료</div>
                    <div class="popup-message">버튼을 눌러주세요</div>
                   </div>`,
            showConfirmButton: true,
            confirmButtonText: '확인',
            allowOutsideClick: false,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            showClass: {
                popup: 'animate__animated animate__fadeIn'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut'
            },
            customClass: {
                container: 'popup-container',
                popup: 'custom-popup',
                title: 'popup-title-class',
                confirmButton: 'popup-confirm-button',
                htmlContainer: 'popup-content-container'
            }
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
        Swal.fire({
            title: `<div class="popup-title">
                        <div class="ready-icon">🎮</div>
                        <div class="ready-text">준비 완료!</div>
                    </div>`,
            html: `<div class="popup-content">
                    <div class="ready-status">
                        <div class="ready-count">${readyPlayers+1}/${gameUseRef.current.players.length}</div>
                        <div class="ready-message">명의 플레이어가 준비되었습니다</div>
                    </div>
                    <div class="ready-waiting">다른 플레이어를 기다리는 중...</div>
                   </div>`,
            showConfirmButton: false,
            allowOutsideClick: false,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            showClass: {
                popup: 'animate__animated animate__fadeIn'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut'
            },
            customClass: {
                container: 'popup-container',
                popup: 'custom-popup ready-popup',
                title: 'popup-title-class',
                htmlContainer: 'popup-content-container'
            }
        });
        
        setRedyStatus(false);
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


        sendMessage('/app/game.newTurn', {
            gameId: LiarGameId,
            
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
        
        Swal.fire({
            title: `<div class="popup-title">
                        <div class="warning-icon">⚠️</div>
                        <div class="warning-text">정말 나가시겠습니까?</div>
                    </div>`,
            html: `<div class="popup-content">
                    <div class="warning-message">이 작업은 되돌릴 수 없습니다!</div>
                   </div>`,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: '나가기',
            cancelButtonText: '취소',
            allowOutsideClick: false,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            showClass: {
                popup: 'animate__animated animate__fadeIn'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut'
            },
            customClass: {
                container: 'popup-container',
                popup: 'custom-popup warning-popup',
                title: 'popup-title-class',
                confirmButton: 'warning-confirm-button',
                cancelButton: 'warning-cancel-button',
                htmlContainer: 'popup-content-container'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                sendMessage('/app/game.leave', {gameId : LiarGameId, nickname : nickname})
            }
        })
        
    };

    const handleVoteClick = (playerNickname) => {
        if (!isTurnEnd.current) return;
        
        // 이미 같은 플레이어를 선택했다면 선택 취소
        if (selectedVote) {
            Swal.fire({
                title: `<div class="popup-title">
                            <div class="warning-icon">⚠️</div>
                            <div class="warning-text">투표 불가</div>
                        </div>`,
                html: `<div class="popup-content">
                        <div class="warning-message">이미 투표를 완료하셨습니다!</div>
                       </div>`,
                showConfirmButton: true,
                confirmButtonText: '확인',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                customClass: {
                    popup: 'custom-popup warning-popup',
                    confirmButton: 'warning-confirm-button'
                }
            });
            return;
        }

        Swal.fire({
            title: `<div class="popup-title">
                        <div class="vote-icon">
                        <img src="${image}" class="liar-icon" alt="Liar Icon"/></div>
                        <div class="vote-text">라이어 투표</div>
                    </div>`,
            html: `<div class="popup-content">
                    <div class="vote-target">${playerNickname}<br><br></div>
                    <div class="vote-message">님을 라이어로 지목하시겠습니까?</div>
                   </div>`,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: '투표하기',
            cancelButtonText: '취소',
            allowOutsideClick: false,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            showClass: {
                popup: 'animate__animated animate__fadeIn'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut'
            },
            customClass: {
                container: 'popup-container',
                popup: 'custom-popup vote-popup',
                title: 'popup-title-class',
                confirmButton: 'vote-confirm-button',
                cancelButton: 'vote-cancel-button',
                htmlContainer: 'popup-content-container'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: `<div class="popup-title">
                                <div class="vote-complete-icon">✓</div>
                                <div class="vote-complete-text">투표 완료</div>
                            </div>`,
                    showConfirmButton: false,
                    timer: 1500,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    customClass: {
                        popup: 'custom-popup vote-complete-popup',
                        title: 'popup-title-class'
                    }
                });
                setSelectedVote(playerNickname);
                
                // 투표 처리 로직
                sendMessage('/app/game.vote', {
                    gameId: gameId,
                    playerNickname : playerNickname
                });
            }
          });
        
        
    };

    const endVote = (data) => {
        console.log("투표 완료");
        console.log("라이어 : " , data.Liar);

        const voteResults = data.result;
        const formattedResults = Object.entries(voteResults)
            .map(([player, votes]) => `${player}: ${votes}표`)
            .join('\n');

        Swal.fire({
            title: `<div class="popup-title">
                        <div class="vote-count-icon">📊</div>
                        <div class="vote-count-text">투표 집계 결과</div>
                    </div>`,
            html: `<div class="popup-content">
                    <div class="vote-count-results">
                        ${Object.entries(voteResults).map(([player, votes]) => `
                            <div class="vote-count-item">
                                <div class="vote-player-info">
                                    <span class="vote-player-name">${player}</span>
                                    <div class="vote-bar-container">
                                        <div class="vote-bar" style="width: ${(votes / Object.keys(voteResults).length) * 100}%"></div>
                                    </div>
                                </div>
                                <span class="vote-count-number">${votes}표</span>
                            </div>
                        `).join('')}
                    </div>
                   </div>`,
            showConfirmButton: true,
            confirmButtonText: '확인',
            showCancelButton: false,
            allowOutsideClick: false,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            showClass: {
                popup: 'animate__animated animate__fadeIn'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut'
            },
            customClass: {
                container: 'popup-container',
                popup: 'custom-popup vote-count-popup',
                confirmButton: 'vote-count-button',
                title: 'popup-title-class',
                htmlContainer: 'popup-content-container'
            }
        }).then((result) => {
            if (result.isConfirmed) {

                if(data.status === "Draw"){
                    Swal.fire({
                        title: `<div class="popup-title">
                                    <div class="result-icon">🔄</div>
                                    <div class="result-text">동점 발생!</div>
                               </div>`,
                        html: `<div class="popup-content">
                                <div class="result-message">
                                    <div class="result-main">동점 상황이 발생했습니다</div>
                                    <div class="result-sub">추가 라운드를 진행합니다</div>
                                </div>
                                <div class="result-details">
                                    <div class="detail-item">
                                        <span class="detail-icon">🎲</span>
                                        <span class="detail-text">새로운 라운드가 시작됩니다</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-icon">⏱️</span>
                                        <span class="detail-text">모든 플레이어가 다시 참여합니다</span>
                                    </div>
                                </div>
                               </div>`,
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                        showConfirmButton: true,
                        confirmButtonText: '다음 라운드',
                        allowOutsideClick: false,
                        showClass: {
                            popup: 'animate__animated animate__fadeIn'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOut'
                        },
                        customClass: {
                            container: 'popup-container',
                            popup: 'custom-popup result-popup',
                            confirmButton: 'result-button',
                            title: 'popup-title-class',
                            htmlContainer: 'popup-content-container'
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            startNextTurnRound();
                        }
                    });
                }
                else{
                    Swal.fire({
                        title: `<div class="popup-title">
                                    <div class="result-icon">${data.winner === 'Player' ? '🎯' : '❌'}</div>
                                    <div class="result-text">${data.winner === 'Player' ? '라이어 발견!' : '라이어 실패!'}</div>
                               </div>`,
                        html: `<div class="popup-content">
                                <div class="result-message">
                                    <div class="result-main">${data.winner === 'Player' ? '라이어를 찾았습니다!' : '라이어를 찾지 못했습니다'}</div>
                                    <div class="result-sub">${data.winner === 'Player' ? '시민들의 승리입니다!' : '라이어의 승리입니다!'}</div>
                                </div>
                                <div class="result-details">
                                    <div class="detail-item">
                                        <span class="detail-icon">🎭</span>
                                        <span class="detail-text">라이어: ${data.Liar}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-icon">🎯</span>
                                        <span class="detail-text">제시어: ${gameUseRef.current.keywords[gameUseRef.current.currentRound-1]}</span>
                                    </div>
                                </div>
                               </div>`,
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                        showConfirmButton: true,
                        confirmButtonText: '확인',
                        showCancelButton: false,
                        allowOutsideClick: false,
                        showClass: {
                            popup: 'animate__animated animate__fadeIn'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOut'
                        },
                        customClass: {
                            container: 'popup-container',
                            popup: 'custom-popup result-popup',
                            confirmButton: 'result-button',
                            title: 'popup-title-class',
                            htmlContainer: 'popup-content-container'
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {

                            if(data.winner === "Player"){
                                if(data.Liar === nickname) {
                                    // 라이어인 경우 정답 입력 창 표시
                                    Swal.fire({
                                        title: `<div class="popup-title">
                                                    <div class="answer-icon">🎯</div>
                                                    <div class="answer-text">정답 입력</div>
                                               </div>`,
                                        html: `<div class="popup-content">
                                                <div class="answer-message">
                                                    <div class="answer-main">제시어를 맞춰보세요!</div>
                                                    <div class="answer-sub">라이어는 제시어를 추측하여 입력해주세요</div>
                                                </div>
                                               </div>`,
                                        input: 'text',
                                        inputPlaceholder: '정답을 입력하세요...',
                                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                        showCancelButton: true,
                                        confirmButtonText: '제출',
                                        cancelButtonText: '취소',
                                        showClass: {
                                            popup: 'animate__animated animate__fadeIn'
                                        },
                                        hideClass: {
                                            popup: 'animate__animated animate__fadeOut'
                                        },
                                        customClass: {
                                            container: 'popup-container',
                                            popup: 'custom-popup answer-popup',
                                            input: 'answer-input',
                                            confirmButton: 'answer-confirm-button',
                                            cancelButton: 'answer-cancel-button',
                                            title: 'popup-title-class',
                                            htmlContainer: 'popup-content-container'
                                        }
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            
                                            // 투표 처리 로직
                                            sendMessage('/app/game.answer', {
                                                gameId: gameId,
                                                answer: result.value
                                            });
                                        }
                                    });
                                } else {
                                    // 라이어가 아닌 경우 대기 메시지 표시
                                    Swal.fire({
                                        title: '라이어가 정답을 입력중입니다',
                                        text: '잠시만 기다려주세요...',
                                        showConfirmButton: false,
                                        allowOutsideClick: false,
                                        didOpen: () => {
                                            Swal.showLoading();
                                        }
                                    });
                                }
                            }
                        else{
                            if(data.Liar === nickname){
                                Swal.fire({
                                    title: '게임 결과',
                                    html: `
                                        <div style="text-align: left; margin: 20px;">
                                            <h3>라이어 승리!</h3>
                                             <pre style="margin-top: 10px; font-size: 1.1em; line-height: 1.5;">라이어가 모두를 속였습니다. </pre>
                                        </div>
                                    `,
                                    icon: 'info',
                                    confirmButtonText: '확인',
                                    showCancelButton: false,
                                    allowOutsideClick: false,
                                    customClass: {
                                        container: 'vote-result-swal'
                                    }
                                }).then((result) => {
                                   
                                    if(data.currentRound === data.round){
                                        Swal.fire({
                                            title: '게임 종료',
                                            
                                            icon: 'info',
                                            confirmButtonText: '확인',
                                            showCancelButton: false,
                                            allowOutsideClick: false,
                                            customClass: {
                                                container: 'vote-result-swal'
                                            }
                                        }).then((result) => {
        
                                            sendMessage('/app/game.end', {
                                                gameId: gameId,
                                                winner : "Liar"
                                            });
                                        })
                                    }
                                    else { Swal.fire({
                                        title: '다음 라운드',
                                        
                                        icon: 'info',
                                        confirmButtonText: '게임 시작',
                                        showCancelButton: false,
                                        allowOutsideClick: false,
                                        customClass: {
                                            container: 'vote-result-swal'
                                        }
                                    }).then((result) => {
    
                                        sendMessage('/app/game.nextRound', {
                                            gameId: gameId,
                                            winner : "Liar"
                                        });
                                    })
                                }
                            })
                        }
                        else{
                            Swal.fire({
                                title: '게임 결과',
                                html: `
                                    <div style="text-align: left; margin: 20px;">
                                        <h3>라이어 승리! ㅜㅜ</h3>
                                         <pre style="margin-top: 10px; font-size: 1.1em; line-height: 1.5;">라이어에게 속았습니다 ㅜㅜ </pre>
                                    </div>
                                `,
                                icon: 'info',
                                confirmButtonText: '확인',
                                showCancelButton: false,
                                allowOutsideClick: false,
                                customClass: {
                                    container: 'vote-result-swal'
                                }
                            }).then((result) => {
                                if(data.currentRound === data.round){
                                    Swal.fire({
                                        title: '게임 종료',
                                        
                                        icon: 'info',
                                        confirmButtonText: '확인',
                                        showCancelButton: false,
                                        allowOutsideClick: false,
                                        customClass: {
                                            container: 'vote-result-swal'
                                        }
                                    }).then((result) => {
                    
                                        sendMessage('/app/game.end', {
                                            gameId: gameId,
                                            winner : "Liar"
                                        });
                                    })
                                }
                                else { Swal.fire({
                                    title: '다음 라운드',
                                    
                                    icon: 'info',
                                    confirmButtonText: '게임 시작',
                                    showCancelButton: false,
                                    allowOutsideClick: false,
                                    customClass: {
                                        container: 'vote-result-swal'
                                    }
                                }).then((result) => {
    
                                    sendMessage('/app/game.nextRound', {
                                        gameId: gameId,
                                        winner : "Liar"
                                    });
                                })
                            }
                        })
                        }
                }
            }
            

                    });
                }
               
                    
                    // 투표 UI 초기화
                    setShowVotingUI(false);
                    isTurnEnd.current = false;
                    setSelectedVote(null);
                }
            });
    };

    const voteAnswerResult = (data) =>{

        if(data.winner === 'Liar'){
             // 투표 결과 Swal에만 적용될 스타일
                const voteResultStyles = `
                <style>
                    .vote-result-swal .swal2-popup {
                        background: rgba(0, 0, 0, 0.9);
                        border-radius: 15px;
                        padding: 20px;
                        animation: zoomIn 0.3s ease-out;
                    }
                    .vote-result-swal .swal2-title,
                    .vote-result-swal .swal2-content {
                        color: white !important;
                    }
                    .vote-result-swal .swal2-html-container {
                        margin: 1em 0;
                    }
                    .vote-result-swal pre {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 15px;
                        border-radius: 10px;
                        margin-top: 15px;
                        font-family: 'Arial', sans-serif;
                        white-space: pre-wrap;
                    }
                    @keyframes zoomIn {
                        from {
                            opacity: 0;
                            transform: scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                </style>
            `;
            if(data.Liar === nickname){
                Swal.fire({
                    title: '게임 결과',
                    html: `
                        ${voteResultStyles}
                        <div style="text-align: left; margin: 20px;">
                            <h3>라이어 승리!</h3>
                             <pre style="margin-top: 10px; font-size: 1.1em; line-height: 1.5;">정답을 맞췄습니다. </pre>
                        </div>
                    `,
                    icon: 'info',
                    confirmButtonText: '확인',
                    showCancelButton: false,
                    allowOutsideClick: false,
                    customClass: {
                        container: 'vote-result-swal'
                    }
                }).then((result) => {
                    if(data.currentRound === data.round){
                        Swal.fire({
                            title: '게임 종료',
                            
                            icon: 'info',
                            confirmButtonText: '확인',
                            showCancelButton: false,
                            allowOutsideClick: false,
                            customClass: {
                                container: 'vote-result-swal'
                            }
                        }).then((result) => {
        
                            sendMessage('/app/game.end', {
                                gameId: gameId,
                                winner : "Liar"
                            });
                        })
                    }
                    else { Swal.fire({
                        title: '다음 라운드',
                        
                        icon: 'info',
                        confirmButtonText: '게임 시작',
                        showCancelButton: false,
                        allowOutsideClick: false,
                        customClass: {
                            container: 'vote-result-swal'
                        }
                    }).then((result) => {
    
                        sendMessage('/app/game.nextRound', {
                            gameId: gameId,
                            winner : "Liar"
                        });
                    })
                }
            })
        }
        else{
            Swal.fire({
                title: '게임 결과',
                html: `
                    ${voteResultStyles}
                    <div style="text-align: left; margin: 20px;">
                        <h3>라이어 승리 ㅠㅠ</h3>
                         <pre style="margin-top: 10px; font-size: 1.1em; line-height: 1.5;">라이어가 ${data.answer}를 맞췄습니다.</pre>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: '확인',
                showCancelButton: false,
                allowOutsideClick: false,
                customClass: {
                    container: 'vote-result-swal'
                }
            }).then((result) => {
                if(data.currentRound === data.round){
                    Swal.fire({
                        title: '게임 종료',
                        
                        icon: 'info',
                        confirmButtonText: '확인',
                        showCancelButton: false,
                        allowOutsideClick: false,
                        customClass: {
                            container: 'vote-result-swal'
                        }
                    }).then((result) => {
    
                        sendMessage('/app/game.end', {
                            gameId: gameId,
                            winner : "Liar"
                        });
                    })
                }
                Swal.fire({
                    title: '다음 라운드',
                    
                    icon: 'info',
                    confirmButtonText: '게임 시작',
                    showCancelButton: false,
                    allowOutsideClick: false,
                    customClass: {
                        container: 'vote-result-swal'
                    }
                }).then((result) => {

                    sendMessage('/app/game.nextRound', {
                        gameId: gameId,
                        winner : "Liar"
                    });
                })

            })
        }
                
        }
        else{

            if(data.Liar === nickname){
                const voteResultStyles = `
                <style>
                    .vote-result-swal .swal2-popup {
                        background: rgba(0, 0, 0, 0.9);
                        border-radius: 15px;
                        padding: 20px;
                        animation: zoomIn 0.3s ease-out;
                    }
                    .vote-result-swal .swal2-title,
                    .vote-result-swal .swal2-content {
                        color: white !important;
                    }
                    .vote-result-swal .swal2-html-container {
                        margin: 1em 0;
                    }
                    .vote-result-swal pre {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 15px;
                        border-radius: 10px;
                        margin-top: 15px;
                        font-family: 'Arial', sans-serif;
                        white-space: pre-wrap;
                    }
                    @keyframes zoomIn {
                        from {
                            opacity: 0;
                            transform: scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                </style>
            `;
                Swal.fire({
                    title: '게임 결과',
                    html: `
                        ${voteResultStyles}
                        <div style="text-align: left; margin: 20px;">
                            <h3>플레이어 승리! ㅠㅠ</h3>
                             <pre style="margin-top: 10px; font-size: 1.1em; line-height: 1.5;">정답이 틀렸습니다. </pre>
                        </div>
                    `,
                    icon: 'info',
                    confirmButtonText: '확인',
                    showCancelButton: false,
                    allowOutsideClick: false,
                    customClass: {
                        container: 'vote-result-swal'
                    }
                }).then((result) => {
                    if(data.currentRound === data.round){
                        Swal.fire({
                            title: '게임 종료',
                            
                            icon: 'info',
                            confirmButtonText: '확인',
                            showCancelButton: false,
                            allowOutsideClick: false,
                            customClass: {
                                container: 'vote-result-swal'
                            }
                        }).then((result) => {
        
                            sendMessage('/app/game.end', {
                                gameId: gameId,
                                winner : "Player"
                            });
                        })
                    }
                    else { Swal.fire({
                        title: '다음 라운드',
                        
                        icon: 'info',
                        confirmButtonText: '게임 시작',
                        showCancelButton: false,
                        allowOutsideClick: false,
                        customClass: {
                            container: 'vote-result-swal'
                        }
                    }).then((result) => {
    
                        sendMessage('/app/game.nextRound', {
                            gameId: gameId,
                            winner : "Player"
                        });
                    })
                }
            })
        }
        else{
            const voteResultStyles = `
                <style>
                    .vote-result-swal .swal2-popup {
                        background: rgba(0, 0, 0, 0.9);
                        border-radius: 15px;
                        padding: 20px;
                        animation: zoomIn 0.3s ease-out;
                    }
                    .vote-result-swal .swal2-title,
                    .vote-result-swal .swal2-content {
                        color: white !important;
                    }
                    .vote-result-swal .swal2-html-container {
                        margin: 1em 0;
                    }
                    .vote-result-swal pre {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 15px;
                        border-radius: 10px;
                        margin-top: 15px;
                        font-family: 'Arial', sans-serif;
                        white-space: pre-wrap;
                    }
                    @keyframes zoomIn {
                        from {
                            opacity: 0;
                            transform: scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                </style>
            `;
            Swal.fire({
                title: '게임 결과',
                html: `
                    ${voteResultStyles}
                    <div style="text-align: left; margin: 20px;">
                        <h3>플레이어 승리!</h3>
                         <pre style="margin-top: 10px; font-size: 1.1em; line-height: 1.5;">라이어가 정답을 틀렸습니다.</pre>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: '확인',
                showCancelButton: false,
                allowOutsideClick: false,
                customClass: {
                    container: 'vote-result-swal'
                }
            }).then((result) => {
                if(data.currentRound === data.round){
                    Swal.fire({
                        title: '게임 종료',
                        icon: 'info',
                        confirmButtonText: '결과 확인',
                        showCancelButton: false,
                        allowOutsideClick: false,
                        customClass: {
                            container: 'vote-result-swal'
                        }
                    }).then((result) => {
    
                        sendMessage('/app/game.end', {
                            gameId: gameId,
                            winner : "Player"
                        });
                    })
                }
                else { Swal.fire({
                    title: '다음 라운드',
                    
                    icon: 'info',
                    confirmButtonText: '게임 시작',
                    showCancelButton: false,
                    allowOutsideClick: false,
                    customClass: {
                        container: 'vote-result-swal'
                    }
                }).then((result) => {

                    sendMessage('/app/game.nextRound', {
                        gameId: gameId,
                        winner : "Player"
                    });
                })
            }
        })
    }
        }
    }

    const endGame = () =>{
        const formattedResults = Object.entries(gameResult.current.gameResult)
        
        console.log("1232412123 : " ,formattedResults)
        const voteResultStyles = `
                <style>
                    .vote-result-swal .swal2-popup {
                        background: rgba(0, 0, 0, 0.9);
                        border-radius: 15px;
                        padding: 20px;
                        animation: zoomIn 0.3s ease-out;
                    }
                    .vote-result-swal .swal2-title,
                    .vote-result-swal .swal2-content {
                        color: white !important;
                    }
                    .vote-result-swal .swal2-html-container {
                        margin: 1em 0;
                    }
                    .vote-result-swal pre {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 15px;
                        border-radius: 10px;
                        margin-top: 15px;
                        font-family: 'Arial', sans-serif;
                        white-space: pre-wrap;
                    }
                    @keyframes zoomIn {
                        from {
                            opacity: 0;
                            transform: scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                </style>
            `;
            Swal.fire({
                title: `${gameResult.current.winner} 우승 !!`,
                html: `
                        ${voteResultStyles}
                        <div style="text-align: left; margin: 20px;">
                            <h3> 점수 </h3>
                            ${formattedResults.map((result, index) => {
                                return `
                                    <pre style="margin-top: 10px; font-size: 1.1em; line-height: 1.5;">${result[0]} : ${result[1]} 점</pre>
                                `;
                            }).join('')}
                        </div>
                    `,
                icon: 'info',
                confirmButtonText: '확인',
                showCancelButton: false,
                allowOutsideClick: false,
                customClass: {
                    container: 'vote-result-swal'
                }
            }).then((result) => {
                navigate("/liar");
            })
        }
 
    

    
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
                            <div key={index} className={`player-card ${currentTypingPlayerRef.current === player.nickname ? 'typing' : ''}`}>
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

export default LiarGame;
