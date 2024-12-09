/**
 * WebSocket을 사용한 채팅 서비스 클래스
 * STOMP 프로토콜을 통해 서버와의 실시간 통신을 관리
 */

import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;
let messageHandler = null;
let currentSubscription = null;
let globalSubscription = null;

export const connectWebSocket = () => {
    return new Promise((resolve, reject) => {
        if (stompClient && stompClient.connected) {
            resolve(stompClient);
            return;
        }

        const socket = new SockJS('http://localhost:8080/speed-game');
        stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = () => {
            console.log('WebSocket 연결 성공');
            resolve(stompClient);
        };

        stompClient.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
            reject(new Error('WebSocket 연결 실패'));
        };

        stompClient.activate();
    });
};

export const subscribeToGlobal = () => {
    if (!stompClient || !stompClient.connected) {
        throw new Error('WebSocket이 연결되어 있지 않습니다.');
    }

    if (globalSubscription) {
        globalSubscription.unsubscribe();
    }

    globalSubscription = stompClient.subscribe('/topic/speed_game', (message) => {
        const response = JSON.parse(message.body);
        console.log('전체 메시지 수신:', response);
        
        if (messageHandler) {
            messageHandler(response);
        }
    });

    console.log('전체 메시지 구독 완료');
};

export const subscribeToRoom = (roomId) => {
    if (!stompClient || !stompClient.connected) {
        throw new Error('WebSocket이 연결되어 있지 않습니다.');
    }

    // 기존 방 구독 해제
    if (currentSubscription) {
        currentSubscription.unsubscribe();
        currentSubscription = null;
    }

    // 새로운 방 구독
    currentSubscription = stompClient.subscribe(`/topic/speed_game/${roomId}`, (message) => {
        const response = JSON.parse(message.body);
        console.log(`방 ${roomId}에서 메시지 수신:`, response);
        
        if (messageHandler) {
            messageHandler(response);
        }
    });

    console.log(`방 ${roomId} 구독 완료`);
    return currentSubscription;
};

export const unsubscribeFromRoom = () => {
    if (currentSubscription) {
        currentSubscription.unsubscribe();
        currentSubscription = null;
        console.log('방 구독 해제 완료');
    }
};

export const sendMessage = async (destination, message) => {
    if (!stompClient || !stompClient.connected) {
        throw new Error('WebSocket이 연결되어 있지 않습니다.');
    }

    try {
        await stompClient.publish({
            destination: destination,
            body: JSON.stringify(message)
        });
        console.log('메시지 전송 완료:', { destination, message });
    } catch (error) {
        console.error('메시지 전송 실패:', error);
        throw error;
    }
};

export const setMessageHandler = (handler) => {
    messageHandler = handler;
};

export const disconnectWebSocket = () => {
    if (stompClient) {
        if (currentSubscription) {
            currentSubscription.unsubscribe();
            currentSubscription = null;
        }
        if (globalSubscription) {
            globalSubscription.unsubscribe();
            globalSubscription = null;
        }
        stompClient.deactivate();
        stompClient = null;
        console.log('WebSocket 연결 해제 완료');
    }
};
