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
    const [passedPlayers, setPassedPlayers] = useState(null);
    const [game, setGame] = useState(null);
    const gameUseRef = useRef(null);
    const [countdown, setCountdown] = useState(null);
    let swalInstance;
    



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

    const [timeLeft, setTimeLeft] = useState(100); // 2분 = 120초
    const [answers, setAnswers] = useState({}); // answers 상태 초기화
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [timerStatus,setTimerStatus] = useState(false);

    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        let isSubscribed = true;

        // 게임 퇴장 처리 함수
        const handleGameLeave = async () => {
            try {
                if (client.current && client.current.connected) {
                    await client.current.publish({
                        destination: '/app/speed_game.leave',
                        body: JSON.stringify({
                            speedGameId: SpeedGameId,
                            nickname: nickname
                        })
                    });
                    await disconnectWebSocket();
                }
                navigate('/speedQuiz', { replace: true });
            } catch (error) {
                console.error('Error during game leave:', error);
            }
        };

        // 새로고침 감지 및 처리
        const handleBeforeUnload = (e) => {
            // 기본 새로고침 대화상자 방지
            e.preventDefault();
            
            // 퇴장 처리 실행
            if (client.current && client.current.connected) {
                client.current.publish({
                    destination: '/app/speed_game.leave',
                    body: JSON.stringify({
                        speedGameId: SpeedGameId,
                        nickname: nickname
                    })
                });
                disconnectWebSocket();
                navigate("/speedQuiz");
            }
            

            
            // 브라우저 기본 동작 방지
            e.returnValue = '';
        };

        // 키보드 새로고침 감지
        const handleKeyDown = (e) => {
            if ((e.key === 'F5') || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
                e.preventDefault();
                handleBeforeUnload(e);
            }
        };

        // 이벤트 리스너 등록
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('keydown', handleKeyDown);
            isSubscribed = false;
        };
    }, [gameId, navigate]);

    useEffect(() => {
        let isSubscribed = true;

        const connectAndSetup = async () => {
            try {
                client.current = await connectWebSocket();
                console.log("게임 웹소켓 연결 성공");

                client.current.onWebSocketClose = () => {
                    console.log("웹소켓 연결이 끊어졌습니다.");
                    // 브라우저가 닫히는 중이 아닐 때만 알림 표시
                    
                };

                await subscribeToRoom(gameId);
                console.log(`게임 ${gameId} 구독 완료`);

                sendMessage('/app/speed_game.getSpeedQuizGame', {SpeedGameId : SpeedGameId });

                setCountdown(3);

                setMessageHandler((response) => {
                    if (!isSubscribed) return;
                    
                    console.log("게임 서버로부터 메시지 수신:", response);
                    
                    switch(response.type) {
                        case 'GET_GAME':

                            if(!response.data){
                                navigate("/speedQuiz");
                            }

                            quizUseRef.current = response.data.quizzes;
                            gameUseRef.current = response.data;
                            
                            gameStart(response.data);
                            break;
                        case 'SUBMIT_NO_ANSWER':
                            const players = gameUseRef.current?.players || {};
                            const currentPlayer = Object.entries(players).find(([_, player]) => 
                                player.nickname === response.data.sender
                            );
                            setAnswers(prev => ({
                            ...prev,
                            [currentPlayer[0]]: response.data.content
                        }));

                            break;
                        case 'SUBMIT_ANSWER':
                            // 정답자가 있는 경우
                            answerdQuizzed(response.data);
                            gameUseRef.current = response.data.game;
                            console.log(gameUseRef.current);
                            setGame(response.data.game);
                            
                            break;
                        case 'PASS':
                            if(response.data.result === "READY"){
                                passIng(response.data);
                            }
                            else{
                                passEnd();

                            }
                   

                            break;
                        case 'GAME_END':
                            console.log("게임 종료");
                            gameEnd(response.data);

                            break;
                        case 'START':
                            if(response.data.Status === "READY"){
                                console.log("서버 닉네임 : " , response.data.nickname );
                                console.log("현재 닉네임 : " , nickname );
                                if(response.data.nickname === nickname){
                                    // 기존 팝업 닫기
                                    Swal.close();
                                    
                                    // 대기 팝업 표시
                                    swalInstance = Swal.fire({
                                        title: '<div class="popup-title">' +
                                                '<div class="waiting-icon">⏳</div>' +
                                                '<div class="waiting-text">다른 유저를 기다리는 중</div>' +
                                               '</div>',
                                        html: '<div class="popup-content">' +
                                              '<div class="waiting-message">잠시만 기다려 주세요</div>' +
                                              '<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>' +
                                              '</div>',
                                        allowOutsideClick: false,
                                        showConfirmButton: false,
                                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                        customClass: {
                                            container: 'popup-container',
                                            popup: 'custom-popup waiting-popup',
                                            title: 'popup-title-class',
                                            htmlContainer: 'popup-content-container'
                                        }
                                    });
                                }
                            } else {   
                                // 모든 활성화된 팝업 강제 종료
                                Swal.close();
                                
                                // 게임 데이터 업데이트
                                if (response.data.game) {
                                    setGame(response.data.game);
                                    gameUseRef.current = response.data.game;
                                }

                                // 게임 시작 알림 팝업 표시 후 자동으로 닫힘
                                Swal.fire({
                                    title: '<div class="popup-title">' +
                                            '<div class="game-icon">🎯</div>' +
                                            '<div class="game-text">게임이 시작됩니다!</div>' +
                                           '</div>',
                                    html: '<div class="popup-content">' +
                                          '<div class="game-message">첫 번째 문제가 시작됩니다</div>' +
                                          '<div class="game-sub">빠르게 정답을 맞춰보세요!</div>' +
                                          '</div>',
                                    timer: 1500,
                                    timerProgressBar: true,
                                    showConfirmButton: false,
                                    allowOutsideClick: false,
                                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                    customClass: {
                                        container: 'popup-container',
                                        popup: 'custom-popup game-popup',
                                        title: 'popup-title-class',
                                        htmlContainer: 'popup-content-container'
                                    },
                                    didOpen: () => {
                                        // 팝업이 열리면 타이머 시작
                                        Swal.showLoading();
                                    },
                                    willClose: () => {
                                        // 팝업이 닫히기 전에 실행
                                        console.log("게임 시작 팝업이 닫힙니다.");
                                    }
                                }).then((result) => {
                                    // 팝업이 닫힌 후 게임 시작
                                    if (result.dismiss === Swal.DismissReason.timer) {
                                        console.log("타이머로 인해 팝업이 닫혔습니다.");
                                        startGame();
                                    }
                                });
                            }
                            break;
                        case 'ANSWER':

                            break;
                        
                        case 'END_GAME':
              
     
                            break;
                        
                        case 'CHAT':
                 

                            break;
                    
                        case 'REMOVE':
                            console.log(response.data.result);
                            if (response.data.result === 'removeGame') {
                                // 게임 상태와 관련된 상태들을 초기화
                                setGameState('finished');
                                setGame(null);
             
                                
                                Swal.fire({
                                    title: `게임이 종료`,
                                    icon: 'success',
                                    confirmButtonText: '확인'
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                

                                        navigate("/speedQuiz");
                                    }
                                });
                            }
                            else{
                                if(response.data.removePlayer === nickname){
                                    setGameState('finished');
                                    setGame(null);
                
                                    
                                    Swal.fire({
                                        title: `게임이 종료`,
                                        icon: 'success',
                                        confirmButtonText: '확인'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                    

                                            navigate("/speedQuiz");
                                        }
                                    });
                                }
                                else{
                                    
                                    
                                    
                                    Swal.fire({
                                        title: `${response.data.removePlayer}님이 퇴장 하셨습니다.`,
                                        icon: 'success',
                                        confirmButtonText: '확인'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            console.log("업데이트 될 게임 : " , response.data.game);
                                            const updatedGame = { ...response.data.game };
                                            setGame(updatedGame);
                                            gameUseRef.current = updatedGame;
                                            // 강제로 리렌더링을 위해 상태 업데이트
                                            // setGameState(prev => prev === 'playing' ? 'playing_update' : 'playing');
                                            Timer();
                                           
                                        }
                                      
                                    });
                                }
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
        };
    }, [gameId, navigate]);



  
   const gameStart = (data) =>{

        if(!nickname){
            Swal.fire({
                title: `해당 게임에 유저가 아닙니다.`,
                icon: 'error',
            }).then(() => {
                
                    navigate("/speedQuiz")
             
            });
        }

        console.log("전달 받은 데이터 : " , data);
        const playerInfo = data.playerInfo;
        console.log("닉네임 : ", nickname);
        console.log("전달 받은 데이터2 : " , playerInfo);
   
        console.log("해당 브라우저 아이디 : " , playerInfo[nickname]);
        const currentBrowserId = localStorage.getItem('speedGame_browserId');
        console.log("해당 브라우저 아이디 : " , currentBrowserId);
        const exists = Object.values(playerInfo).includes(currentBrowserId);
        console.log("맞음 여부 : ", exists);


        if(exists){
    
            // if(playerInfo[nickname] === currentBrowserId){
                setGame(data);
                return;

            // }
            // else{
            //     Swal.fire({
            //         title: `이미 게임이 시작된 방입니다.`,
            //         icon: 'error',
            //         confirmButtonText: '확인'
            //     }).then((result) => {
            //         if (result.isConfirmed) {
            //             navigate("/speedQuiz")
            //         }
            //     });
            // }
            
        }
        else{
            Swal.fire({
                title: `해당 게임에 유저가 아닙니다.`,
                icon: 'error',
            }).then(() => {
                
                    navigate("/speedQuiz")
             
            });
        }
        
    
      
   }



    

   


    useEffect(() => {
        if (countdown === null || !game) return;

        const currentNickname = isHost ? hostName : nickname;
        
        if (countdown === 0) {
            setCountdown(null);
            // 카운트다운이 끝나면 제시어 팝업 표시
            Swal.fire({
                title: '<div class="popup-title">' +
                        '<div class="game-icon">🎮</div>' +
                        '<div class="game-text">스피드 퀴즈 시작!</div>' +
                       '</div>',
                html: '<div class="popup-content">' +
                      '<div class="game-message">준비되셨나요?</div>' +
                      '<div class="game-sub">가장 빠르게 정답을 맞춰보세요!</div>' +
                      '</div>',
                showConfirmButton: true,
                confirmButtonText: '게임 시작',
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
                    popup: 'custom-popup game-popup',
                    title: 'popup-title-class',
                    confirmButton: 'game-confirm-button',
                    htmlContainer: 'popup-content-container'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    sendMessage("/app/speed_game.start", {speedGameId : SpeedGameId , nickname : nickname});
                }
            });
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, game, hostName, nickname, isHost]);

    // useEffect(() => {
    //     if (timerStatus) {
    //         // 시작 시간 저장
    //         startTimeRef.current = Date.now() - ((100 - timeLeft) * 1000);
            
    //         const updateTimer = () => {
    //             const now = Date.now();
    //             const elapsed = Math.floor((now - startTimeRef.current) / 1000);
    //             const newTimeLeft = Math.max(100 - elapsed, 0);
                
    //             if (newTimeLeft <= 0) {
    //                 // 시간 종료
    //                 handleTimeUp();
    //                 setTimeLeft(0);
    //                 return;
    //             }
                
    //             setTimeLeft(newTimeLeft);
    //             timerRef.current = requestAnimationFrame(updateTimer);
    //         };
            
    //         timerRef.current = requestAnimationFrame(updateTimer);
            
    //         return () => {
    //             if (timerRef.current) {
    //                 cancelAnimationFrame(timerRef.current);
    //             }
    //         };
    //     }
      
    // }, [timerStatus]);

    const Timer = () =>{
            // 시작 시간 저장
            startTimeRef.current = Date.now() - ((100 - timeLeft) * 1000);
            
            const updateTimer = () => {
                const now = Date.now();
                const elapsed = Math.floor((now - startTimeRef.current) / 1000);
                const newTimeLeft = Math.max(100 - elapsed, 0);
                
                if (newTimeLeft <= 0) {
                    // 시간 종료
                    handleTimeUp();
                    setTimeLeft(0);
                    return;
                }
                
                setTimeLeft(newTimeLeft);
                timerRef.current = requestAnimationFrame(updateTimer);
            };
            
            timerRef.current = requestAnimationFrame(updateTimer);
            
            return () => {
                if (timerRef.current) {
                    cancelAnimationFrame(timerRef.current);
                }
            };
        
    }



    useEffect(() => {
        if (quizUseRef.current && quizUseRef.current.length > 0) {
            setCurrentQuestionIndex(0);
        }
    }, [quizUseRef.current]);

    useEffect(() => {
        setHasPassedCurrentQuestion(false);
        setPassedPlayers(null);
    }, [currentQuestionIndex]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startGame = () => {
        setGameState('playing');
        setTimerStatus(true);
        Timer();
        
        // 첫 번째 문제 설정
        if (quizUseRef.current && quizUseRef.current.length > 0) {
            setCurrentQuestionIndex(0);
        }
        
       
    };
 


    const answerdQuizzed = (data) =>{
        const winnerId = data.winner;
        setAnswers(prev => ({
            ...prev,
            winner: winnerId
        }));

        // 이전 팝업이 있다면 닫기
        if (Swal.isVisible()) {
            Swal.close();
        }

        if(winnerId === nickname){
            // 전체 화면 폭죽 컨테이너 생성
            const fireworksContainer = document.createElement('div');
            fireworksContainer.className = 'fireworks-container';
            document.body.appendChild(fireworksContainer);

            // 폭죽 효과 설정
            const createFirework = (offsetX, offsetY) => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.left = `${50 + offsetX}%`;
                firework.style.top = `${50 + offsetY}%`;
                
                const particles = document.createElement('div');
                particles.className = 'particles';
                for (let i = 0; i < 12; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.setProperty('--angle', `${i * 30}deg`);
                    particle.style.setProperty('--speed', `${0.8 + Math.random() * 0.4}s`);
                    particle.style.setProperty('--size', `${Math.random() * 2 + 1}px`);
                    particles.appendChild(particle);
                }
                firework.appendChild(particles);
                return firework;
            };

            // 폭죽 위치 설정
            const offsets = [
                [-20, -20], [20, -20],  // 위
                [-25, 0], [25, 0],      // 좌우
                [-20, 20], [20, 20],    // 아래
                [0, -25], [0, 25]       // 상하
            ];

            // 순차적으로 폭죽 생성
            offsets.forEach((offset, index) => {
                setTimeout(() => {
                    const firework = createFirework(offset[0], offset[1]);
                    fireworksContainer.appendChild(firework);
                    
                    // 폭죽 제거
                    setTimeout(() => {
                        firework.remove();
                    }, 2000);
                }, index * 200);
            });

            // 정답자 팝업
            Swal.fire({
                title: '<div class="popup-title">' +
                        '<div class="result-icon">🎯</div>' +
                        '<div class="result-text">정답입니다!</div>' +
                       '</div>',
                html: `<div class="popup-content">
                        <div class="result-animation">
                            <div class="result-content">
                                <div class="winner-name">${winnerId}</div>
                                <div class="result-message">정답을 맞추셨습니다!</div>
                            </div>
                        </div>
                    </div>`,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                showClass: {
                    popup: 'animate__animated animate__zoomIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__zoomOut'
                },
                customClass: {
                    container: 'popup-container',
                    popup: 'custom-popup result-popup',
                    title: 'popup-title-class',
                    htmlContainer: 'popup-content-container'
                },
                willClose: () => {
                    if (fireworksContainer && fireworksContainer.parentNode) {
                        fireworksContainer.remove();
                    }
                }
            });
        } else {
            // 다른 플레이어 팝업
            const showOtherPlayerAlert = () => {
                // 상태 업데이트
                setCurrentQuestionIndex(prev => 
                    prev < quizUseRef.current.length - 1 ? prev + 1 : prev
                );
                setAnswers({});

                // 스타일이 적용된 알림 팝업
                const Toast = Swal.mixin({
                    toast: false, // 일반 팝업으로 변경
                    position: 'center',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    background: 'transparent',
                    customClass: {
                        popup: 'animated zoomIn',
                        title: 'text-white'
                    },
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                    }
                });

                Toast.fire({
                    html: `
                        <div style="
                            padding: 1.5em;
                            color: white;
                            text-align: center;
                        ">
                            <div style="
                                font-size: 2em;
                                margin-bottom: 10px;
                                animation: bounce 1s infinite;
                            ">
                                아쉽네요! 
                            </div>
                            <div style="
                                font-size: 1.5em;
                                font-weight: bold;
                                margin: 15px 0;
                                text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                            ">
                                ${winnerId}님이 정답을 맞추셨습니다!
                            </div>
                            <div style="
                                font-size: 1.2em;
                                color: #FFE0E0;
                                margin-top: 15px;
                                animation: pulse 2s infinite;
                            ">
                                 다음 문제를 준비하세요! 
                            </div>
                            <div style="
                                margin-top: 20px;
                                font-size: 1.8em;
                                animation: sparkle 1.5s infinite;
                            ">
                    
                            </div>
                        </div>
                        <style>
                            @keyframes bounce {
                                0%, 100% { transform: translateY(0); }
                                50% { transform: translateY(-10px); }
                            }
                            @keyframes pulse {
                                0% { opacity: 1; }
                                50% { opacity: 0.7; }
                                100% { opacity: 1; }
                            }
                            @keyframes sparkle {
                                0% { transform: scale(1); }
                                50% { transform: scale(1.2); }
                                100% { transform: scale(1); }
                            }
                        </style>
                    `,
                    width: '400px',
                    padding: '2em'
                });
            };

            // 팝업 표시
            showOtherPlayerAlert();
         

        }
        
        Timer();
    }
    

   
    const handleSendChat = (event) => {
        if (event?.preventDefault) {
            event.preventDefault();
        }
        
        // 입력값이 비어있으면 리턴
        const answerText = currentAnswer.trim();

        if (!answerText) return;
        
        const players = gameUseRef.current?.players || {};
        const currentPlayer = Object.entries(players).find(([_, player]) => 
            player.nickname === nickname
        );
        
        console.log("currentPlayer : ", currentPlayer);
        
        if (!currentPlayer) {
            console.error("현재 플레이어를 찾을 수 없습니다.");
            return;
        }

        const playerId = currentPlayer[0];
      
        
        // 답변을 화면에 표시
        setAnswers(prev => {
            const newAnswers = {
                ...prev,
                [playerId]: answerText
            };

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
            sender: nickname,
            answer: answerText,
            questionIndex: currentQuestionIndex
        });

        // 입력 필드 초기화
        setCurrentAnswer('');
    };

    const passIng = (data) => {
        setPassUser(prev => prev + 1);
        const currentPlayer = gameUseRef.current?.players?.find(
            player => player && player.nickname === nickname
        );
        if (currentPlayer) {
            setPassedPlayers(data.passedPlayer);
        }
    }

    const passEnd = () => {
        Swal.fire({
            title: '다음문제로 넘어 갑니다.',
            iconHtml: `
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="36" fill="rgba(255,255,255,0.1)" stroke="white" stroke-width="3"/>
                    <path d="M30 20L55 40L30 60" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="40" cy="40" r="38" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-dasharray="4 4">
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 40 40"
                            to="360 40 40"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </circle>
                    <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.2)" stroke-width="4">
                        <animate
                            attributeName="r"
                            values="32;34;32"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="stroke-opacity"
                            values="0.2;0.6;0.2"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </svg>
            `,
            showConfirmButton: false,
            timer: 1500,
            background: 'rgba(46, 125, 50, 0.9)',
            color: '#fff',
            allowOutsideClick: false,
            backdrop: `
                rgba(0,0,0,0.7)
                url("/speed/next.gif")
                center top
                no-repeat
            `,
            position: 'top',
            width: '24em',
            padding: '2em',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            },
            customClass: {
                icon: 'next-question-custom-icon'
            },
            willClose: () => {
                setCurrentQuestionIndex(prev => 
                    prev < quizUseRef.current.length - 1 ? prev + 1 : prev
                );
                setAnswers({});
                setPassUser(0);
                setPassedPlayers(null);
                setTimeLeft(100);
                setTimerStatus(true);
                Timer();
            }
        });
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
        
        sendMessage('/app/speed_game.leave', {speedGameId : SpeedGameId, nickname : nickname})
        
    };

    const handleAnswerChange = (e) => {
        setCurrentAnswer(e.target.value);
    }

    const handleTimeUp = () => {

        passEnd();
        
    };

    const gameEnd = (data) => {
        console.log(data.result);

        // 결과를 배열로 변환하고 점수 순으로 정렬
        const sortedResults = Object.entries(data.result)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
        
        // 1등 플레이어 정보
        const winner = sortedResults[0];
        
        Swal.fire({
            title: '<div class="game-result-title">🏆 Speed Quiz Winner 🏆</div>',
            html: `
                <div class="game-result-container">
                    <div class="winner-section">
                        <div class="crown-icon">👑</div>
                        <div class="winner-name">${winner[0]}</div>
                        <div class="winner-score">${winner[1]} points</div>
                    </div>
                    <div class="results-section">
                        ${sortedResults.slice(1).map(([name, score], index) => `
                            <div class="player-result ${index === 0 ? 'silver' : index === 1 ? 'bronze' : ''}">
                                <div class="rank-badge">${index + 2}</div>
                                <div class="player-name">${name}</div>
                                <div class="player-score">${score} pts</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `,
            confirmButtonText: '게임 종료',
            allowOutsideClick: false,
            customClass: {
                popup: 'game-result-popup',
                confirmButton: 'game-result-button'
            },
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/liar');
            }
        });
    }

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .game-popup {
                border: none !important;
                border-radius: 20px !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
                animation: popupScale 0.3s ease-out !important;
            }
            
            @keyframes popupScale {
                0% { transform: scale(0.8); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .game-popup-title {
                color: #fff !important;
                font-size: 2em !important;
                font-weight: bold !important;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2) !important;
                animation: titleFloat 2s ease-in-out infinite !important;
            }
            
            @keyframes titleFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            
            .game-progress-bar {
                height: 6px !important;
                border-radius: 3px !important;
                background: linear-gradient(to right, #2e7d32, #4caf50) !important;
            }
            
            .game-success-icon {
                border-color: #4caf50 !important;
                color: #4caf50 !important;
                animation: iconPulse 1.5s ease-in-out infinite !important;
            }
            
            @keyframes iconPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            .swal2-icon.swal2-success [class^='swal2-success-line'] {
                background-color: #4caf50 !important;
            }
            
            .swal2-icon.swal2-success .swal2-success-ring {
                border-color: #4caf50 !important;
            }
            
            .result-animation {
                animation: fadeInUp 0.5s ease-out !important;
            }
            
            @keyframes fadeInUp {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            
            .result-content {
                padding: 10px;
            }
            
            .winner-name {
                color: #4caf50;
                font-size: 1.4em;
                font-weight: bold;
                margin-bottom: 5px;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            .result-message {
                color: #fff;
                font-size: 1.2em;
                opacity: 0.9;
            }
            
            .fireworks-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 100000;
            }

            .firework {
                position: fixed;
                width: 6px;
                height: 6px;
                transform: translate(-50%, -50%);
            }

            .particles {
                position: absolute;
                width: 100%;
                height: 100%;
                animation: explode 1s ease-out forwards;
            }

            .particle {
                position: absolute;
                top: 50%;
                left: 50%;
                width: var(--size);
                height: var(--size);
                border-radius: 50%;
                transform-origin: center;
                animation: particle var(--speed) ease-out forwards;
            }

            .particle:nth-child(3n) { 
                background: #ffeb3b; 
                box-shadow: 0 0 30px 15px rgba(255, 235, 59, 0.8);
            }
            .particle:nth-child(3n+1) { 
                background: #00bcd4; 
                box-shadow: 0 0 30px 15px rgba(0, 188, 212, 0.8);
            }
            .particle:nth-child(3n+2) { 
                background: #ff4081; 
                box-shadow: 0 0 30px 15px rgba(255, 64, 129, 0.8);
            }

            @keyframes explode {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }

            @keyframes particle {
                0% {
                    transform: rotate(var(--angle)) translateY(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: rotate(var(--angle)) translateY(150px) scale(0);
                    opacity: 0;
                }
            }

            .game-popup {
                position: relative;
                z-index: 99999;
                animation: popup-glow 2s ease-in-out infinite;
            }

            @keyframes popup-glow {
                0%, 100% { box-shadow: 0 0 30px rgba(46, 125, 50, 0.3); }
                50% { box-shadow: 0 0 50px rgba(46, 125, 50, 0.5); }
            }
        `;
        document.head.appendChild(style);
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current);
            }
        };
    }, []);

    const handlePass = () => {
        if (hasPassedCurrentQuestion || !gameUseRef.current?.players) return;
        
    

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


        

        
        if (currentPlayer) {
            console.log("패스버튼 누름 22");
            setHasPassedCurrentQuestion(true);
            sendMessage('/app/speed_game.pass', {speedGameId : SpeedGameId, nickname : currentPlayer.nickname});
        }

    }



    return (
        <div className="speed-quiz-container">
            <div className="speed-game-header">
                <button className="speed-exit-game-btn" onClick={handleLeaveGame}>
                    나가기
                </button>
                {passUser > 0 && (
                    <div className="pass-status">
                        <div className="pass-count">
                            PASS {passUser}/{gameUseRef.current?.players?.length}
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
                )}
                
            </div>
            {countdown !== null && (
                <div className="countdown-overlay">
                    <div className="countdown-number">{countdown}</div>
                </div>
            )}
            <div className="speed-quiz-board">
                    {gameState === 'playing' && (
                        <div className="timer-bar-container">
                            <div 
                                className={`timer-bar ${timeLeft <= 20 ? 'warning' : ''}`}
                                style={{ width: `${(timeLeft / 100) * 100}%` }}
                            />
                            <div className={`timer-text ${timeLeft <= 20 ? 'warning' : ''}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    )}
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
            <div className="speed-game-content">
                

                <div className="speed-students-container">
                    {[...Array(Object.keys(gameUseRef.current?.players || {}).length)].map((_, index) => {
                        const players = gameUseRef.current?.players || {};
                        const playerEntries = Object.entries(players);
                        const player = playerEntries[index];

          
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
                        className={`speed-answer-submit pass-button ${hasPassedCurrentQuestion ? 'passed' : ''}`}
                        onClick={handlePass}
                        disabled={hasPassedCurrentQuestion}
                    >
                        {hasPassedCurrentQuestion ? '✓' : 'PASS'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SpeedQuizGame;
