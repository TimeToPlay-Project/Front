import React, { useState, useEffect } from "react";
import "./css/LiarMain.css"
import Navigate3 from "../../Navigate3";
import { connectWebSocket, sendMessage, setMessageHandler, disconnectWebSocket } from './websocket/chatService';
import GameRoom from './components/GameRoom';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import liarImage from './assets/image.png';
import LiarNotification from './components/LiarNotification';

function LiarMain() {
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
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

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
        if (!nickname.trim()) {
            setNotificationMessage('닉네임을 입력해주세요.');
            setNotificationOpen(true);
            return;
        }
    
        if (!roomPassword.trim()) {
            setNotificationMessage('비밀번호를 입력해주세요.');
            setNotificationOpen(true);
            return;
        }
    
        

    try {
        const response = await axios.post("http://localhost:8080/api/create/room", {
            nickname: nickname,
            password: roomPassword,
            maxPlayer: maxPlayers
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Response data:", response.data);
            setNotificationMessage(`${nickname}님의 방이 생성되었습니다!`);
            setNotificationOpen(true);
            setShowModal(false);  // 모달 닫기
            
            // 알림이 표시된 후 1초 뒤에 페이지 이동
            setTimeout(() => {
                navigate('/liar/room/' + response.data, {
                    state: { hostName: nickname, isHost: true }
                });
            }, 1000);

    } catch (error) {
        console.error("Error posting data:", error);
        alert("Something went wrong.");
    }
};

    

    const handleJoinClick = () => {
     
        sendMessage('/app/game.getRooms', { type: 'GET_ROOMS' });
        setShowJoinModal(true);
    };

    const handleJoinRoom = () => {
        if (!selectedRoom) {
            setNotificationMessage('방을 선택해주세요.');
            setNotificationOpen(true);
            return;
        }
        if (!joinNickname.trim()) {
            setNotificationMessage('닉네임을 입력해주세요.');
            setNotificationOpen(true);
            return;
        }

        const joinData = {
            type: 'JOIN_ROOM',
            data: {
                roomId: selectedRoom.roomId,
                nickname: joinNickname
            }
        };

        sendMessage('/app/game.joinRoom', joinData);
        setShowJoinModal(false);
        setSelectedRoom(null);
        setJoinNickname('');
    };

    const handleNotificationClose = () => {
        setNotificationOpen(false);
    };

    return (
        <div className="liar-container">
            <div className="Navigate-Box">
                <Navigate3 />
            </div>

            <div className="liar-main-content">
                <div className="liar-background-elements">
                    <div className="liar-pattern-circle"></div>
                    <div className="liar-pattern-line"></div>
                    <div className="liar-pattern-dots"></div>
                </div>

                <div className="liar-content-wrapper">
                    <div className="liar-header-section">
                        <h1 className="liar-main-title">
                            라이어 게임
                            <span className="liar-subtitle">누가 진실을 숨기고 있을까요?</span>
                        </h1>
                        <div className="liar-image-wrapper">
                            <img src={liarImage} alt="라이어" className="main-liar-image" />
                        </div>
                    </div>

                    <div className="liar-action-buttons">
                        <button className="liar-action-button create" onClick={onCreateRoom}>
                            <span className="liar-button-icon">🎭</span>
                            방 만들기
                        </button>
                        <button className="liar-action-button join" onClick={handleJoinClick}>
                            <span className="liar-button-icon">🎲</span>
                            방 참여하기
                        </button>
                    </div>

                    <div className="liar-game-info">
                        <div className="liar-info-card">
                            <h3>게임 규칙</h3>
                            <ul>
                                <li>참가자 중 한 명이 라이어로 선정됩니다</li>
                                <li>제시어를 보고 설명하는 시간이 주어집니다</li>
                                <li>라이어는 제시어를 모른 채 대화에 참여합니다</li>
                                <li>투표를 통해 라이어를 찾아내세요!</li>
                            </ul>
                        </div>
                        <div className="liar-info-card">
                            <h3>게임 특징</h3>
                            <ul>
                                <li>실시간 음성 채팅</li>
                                <li>다양한 주제의 제시어</li>
                                <li>4-8인 멀티플레이</li>
                                <li>랭킹 시스템</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Room Modal */}
            <Dialog
                open={showModal}
                onClose={handleCreateRoomCancle}
                aria-labelledby="create-room-dialog"
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    className: 'liar-dialog'
                }}
            >
                <DialogTitle id="create-room-dialog">
                    새로운 게임 방 생성
                    <div className="dialog-subtitle">라이어를 찾아라!</div>
                </DialogTitle>
                <DialogContent>
                    <div className="input-group">
                        <div className="input-label">플레이어 정보</div>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="당신의 닉네임"
                            type="text"
                            fullWidth
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            variant="outlined"
                            placeholder="닉네임을 입력하세요"
                        />
                    </div>
                    
                    <div className="input-group">
                        <div className="input-label">게임 설정</div>
                        <FormControl fullWidth margin="dense">
                            <InputLabel>플레이어 수</InputLabel>
                            <Select
                                value={maxPlayers}
                                onChange={(e) => setMaxPlayers(e.target.value)}
                                variant="outlined"
                            >
                                <MenuItem value={4}>4명의 플레이어</MenuItem>
                                <MenuItem value={5}>5명의 플레이어</MenuItem>
                                <MenuItem value={6}>6명의 플레이어</MenuItem>
                                <MenuItem value={7}>7명의 플레이어</MenuItem>
                                <MenuItem value={8}>8명의 플레이어</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            margin="dense"
                            label="방 비밀번호"
                            type="password"
                            fullWidth
                            value={roomPassword}
                            onChange={(e) => setRoomPassword(e.target.value)}
                            variant="outlined"
                            placeholder="선택사항"
                            helperText="비밀번호를 설정하지 않으면 공개방으로 생성됩니다"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleCreateRoomCancle}
                        className="dialog-button cancel"
                    >
                        취소하기
                    </Button>
                    <Button 
                        onClick={handleCreateRoom}
                        className="dialog-button create"
                        disabled={!nickname.trim()}
                    >
                        방 생성하기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Join Room Modal */}
            <Dialog
                open={showJoinModal}
                onClose={handleJoinCancle}
                PaperProps={{
                    className: 'liar-dialog'
                }}
            >
                <DialogTitle>방 참여하기</DialogTitle>
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
                    <div className="liar-room-list">
                        {rooms.map((room) => (
                            <div
                                key={room.roomId}
                                className={`liar-room-item ${selectedRoom?.roomId === room.roomId ? 'selected' : ''}`}
                                onClick={() => setSelectedRoom(room)}
                            >
                                <div className="liar-room-info">
                                    <span className="liar-room-host">방장: {room.hostName}</span>
                                    <span className="liar-room-players">
                                        {room.players.length}/{room.maxPlayers}명
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleJoinCancle}>취소</Button>
                    <Button onClick={handleJoinRoom} variant="contained" color="primary">
                        참여하기
                    </Button>
                </DialogActions>
            </Dialog>

            <LiarNotification
                open={notificationOpen}
                message={notificationMessage}
                onClose={handleNotificationClose}
            />
        </div>
    );
}

export default LiarMain;
