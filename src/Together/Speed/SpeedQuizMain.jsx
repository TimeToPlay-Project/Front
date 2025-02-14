import React, { useState, useEffect } from "react";
import "./css/SpeedQuizMain.css"
import Navigate3 from "../../Navigate3";
import { connectWebSocket, sendMessage, setMessageHandler, disconnectWebSocket } from './websocket/chatService';
import GameRoom from './components/SpeedGameRoom';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { FaPlus, FaUsers } from 'react-icons/fa';

function SpeedQuizMain() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [nickname, setNickname] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomPassword, setRoomPassword] = useState('');
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [joinNickname, setJoinNickname] = useState('');
    const [client, setClient] = useState(null);
    const [searchHostName, setSearchHostName] = useState('');
    const [hostStatus, setHostStatus] = useState(false);
    const [hostName, setHostName] = useState('');
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [data, setData] = useState(null);

    const generateBrowserId = () => {
        // localStorage에서 기존 ID 확인
        let browserId = localStorage.getItem('speedGame_browserId');
        
        // 없으면 새로 생성
        if (!browserId) {
            browserId = 'browser_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('speedGame_browserId', browserId);
        }
        
        return browserId;
    };

    const onCreateRoom = () => {
        setShowModal(true);
    };

    const handleCreateRoomCancle = () => {
        setShowModal(false);
        if (client) {
            disconnectWebSocket();
            setClient(null);
        }
        setIsCreatingRoom(false);
    }

    const handleJoinCancle = () => {
        setShowJoinModal(false);
        setSelectedRoom(null);
        setJoinNickname('');
        if (client) {
            disconnectWebSocket();
            setClient(null);
        }
    }

    const handleCreateRoom = async () => {

        const browserId = generateBrowserId(); 
        console.log("브라우저 아이디 : ",  browserId);
        
        if (!nickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }
    
        if (!roomPassword.trim()) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
    
        try {
            const response = await axios.post("http://localhost:8080/api/speed/create/room", {
                nickname: nickname,
                password: roomPassword,
                maxPlayer: maxPlayers,
                browserId: browserId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            console.log("Response data:", response.data);
            alert("Room created successfully!");
            navigate('/speedQuiz/room/' + response.data, {
                state: { hostName: nickname, isHost: true }
            });
    
        } catch (error) {
            console.error("Error posting data:", error);
            alert("Something went wrong.");
        }
    };
    

    const handleJoinClick = () => {
     
        sendMessage('/app/game.getRooms', { type: 'GET_ROOMS' });
        setShowJoinModal(true);
    };

    const handleJoinRoom = (room) => {
        if (!room) {
            alert('방을 선택해주세요.');
            return;
        }
        if (!joinNickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        const joinData = {
            type: 'JOIN_ROOM',
            data: {
                roomId: room.roomId,
                nickname: joinNickname
            }
        };

        sendMessage('/app/game.joinRoom', joinData);
        setShowJoinModal(false);
        setSelectedRoom(null);
        setJoinNickname('');
    };


    return (
        <div className="speed-quiz-main">
            <Navigate3 />
            <div className="speed-container">
                <div className="speed-title-board">
                    <h1 className="speed-title">스피드 퀴즈</h1>
                    <p className="speed-subtitle">친구들과 함께 즐기는 빠른 퀴즈 게임!</p>
                </div>
                
                <div className="speed-button-container">
                    <button className="speed-button create" onClick={onCreateRoom}>
                        <FaPlus className="speed-button-icon" />
                        <span>방 만들기</span>
                    </button>
                    <button className="speed-button join" onClick={() => setShowJoinModal(true)}>
                        <FaUsers className="speed-button-icon" />
                        <span>참여하기</span>
                    </button>
                </div>

                <div className="speed-room-list">
                    <div className="speed-room-header">
                        <h2 className="speed-room-title">현재 진행중인 게임</h2>
                    </div>
                    
                    <div className="speed-search-container">
                        <input
                            type="text"
                            className="speed-search-input"
                            placeholder="방장 닉네임으로 검색..."
                            value={searchHostName}
                            onChange={(e) => setSearchHostName(e.target.value)}
                        />
                    </div>

                    {rooms.map((room) => (
                        <div 
                            key={room.roomId} 
                            className="speed-room-item"
                            onClick={() => handleJoinRoom(room)}
                        >
                            <div className="speed-room-info">
                                <div className="speed-room-host">방장: {room.hostName}</div>
                                <div className="speed-room-players">
                                    참여자: {room.currentPlayers}/{room.maxPlayers}명
                                </div>
                            </div>
                            <div className={`speed-room-status ${room.currentPlayers < room.maxPlayers ? 'open' : 'full'}`}>
                                {room.currentPlayers < room.maxPlayers ? '참여가능' : '진행중'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 방 만들기 다이얼로그 */}
            <Dialog open={showModal} onClose={handleCreateRoomCancle} className="create-room-dialog">
                <DialogTitle>새로운 방 만들기</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="닉네임"
                        type="text"
                        fullWidth
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="방 비밀번호"
                        type="password"
                        fullWidth
                        value={roomPassword}
                        onChange={(e) => setRoomPassword(e.target.value)}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>최대 인원</InputLabel>
                        <Select
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(e.target.value)}
                        >
                            <MenuItem value={2}>2명</MenuItem>
                            <MenuItem value={3}>3명</MenuItem>
                            <MenuItem value={4}>4명</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <div className="bottom-buttons">
                    <button className="bottom-button cancel" onClick={handleCreateRoomCancle}>
                        취소
                    </button>
                    <button className="bottom-button create" onClick={handleCreateRoom}>
                        만들기
                    </button>
                </div>
            </Dialog>

            {/* 참여하기 다이얼로그 */}
            <Dialog open={showJoinModal} onClose={handleJoinCancle} className="join-room-dialog">
                <DialogTitle>게임 참여하기</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="닉네임"
                        type="text"
                        fullWidth
                        value={joinNickname}
                        onChange={(e) => setJoinNickname(e.target.value)}
                    />
                </DialogContent>
                <div className="bottom-buttons">
                    <button className="bottom-button cancel" onClick={handleJoinCancle}>
                        취소
                    </button>
                    <button className="bottom-button create" onClick={handleJoinRoom}>
                        참여하기
                    </button>
                </div>
            </Dialog>
        </div>
    );
}

export default SpeedQuizMain;
