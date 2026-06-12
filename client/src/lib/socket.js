import { io } from 'socket.io-client';
import { API_URL } from './api';

const SOCKET_URL = 'https://queue-hospital-assignment.onrender.com';

let socket;

function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL || API_URL, {
      autoConnect: false,
      transports: ['websocket']
    });
  }

  return socket;
}

export default getSocket;