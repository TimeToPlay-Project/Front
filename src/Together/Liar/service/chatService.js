import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

let stompClient = null;
let roomSubscription = null;
let messageHandler = null;

export const setMessageHandler = (handler) => {
    messageHandler = handler;
};

export const connectWebSocket = () => {
    return new Promise((resolve, reject) => {
        const socket = new SockJS('http://localhost:8080/ws-liar');
        stompClient = Stomp.over(socket);
        
        stompClient.connect(
            {},
            () => {
                console.log('WebSocket 연결 성공');
                resolve(stompClient);
            },
            (error) => {
                console.error('WebSocket 연결 실패:', error);
                reject(error);
            }
        );
    });
};

export const disconnectWebSocket = async () => {
    try {
        if (roomSubscription) {
            await roomSubscription.unsubscribe();
            roomSubscription = null;
        }
        if (stompClient) {
            await stompClient.disconnect();
            stompClient = null;
        }
        console.log('WebSocket 연결 해제 완료');
    } catch (error) {
        console.error('WebSocket 연결 해제 중 에러:', error);
        throw error;
    }
};

export const subscribeToRoom = async (roomId) => {
    if (!stompClient) {
        throw new Error('WebSocket이 연결되어 있지 않습니다.');
    }

    try {
        // 기존 구독이 있다면 해제
        if (roomSubscription) {
            await roomSubscription.unsubscribe();
            roomSubscription = null;
        }

        // 새로운 방 구독
        roomSubscription = stompClient.subscribe(
            `/topic/game/${roomId}`,
            (message) => {
                console.log(`방 ${roomId}에서 메시지 수신:`, message);
                if (messageHandler) {
                    try {
                        const response = JSON.parse(message.body);
                        messageHandler(response);
                    } catch (error) {
                        console.error('메시지 파싱 중 에러:', error);
                    }
                }
            }
        );
        
        console.log(`방 ${roomId} 구독 완료`);
    } catch (error) {
        console.error('방 구독 중 에러:', error);
        throw error;
    }
};

export const unsubscribeFromRoom = async () => {
    if (roomSubscription) {
        try {
            await roomSubscription.unsubscribe();
            roomSubscription = null;
            console.log('방 구독 해제 완료');
        } catch (error) {
            console.error('방 구독 해제 중 에러:', error);
            throw error;
        }
    }
};

export const sendMessage = (destination, message) => {
    if (!stompClient) {
        throw new Error('WebSocket이 연결되어 있지 않습니다.');
    }

    try {
        stompClient.send(destination, {}, JSON.stringify(message));
        console.log('메시지 전송 완료:', { destination, message });
    } catch (error) {
        console.error('메시지 전송 중 에러:', error);
        throw error;
    }
};
