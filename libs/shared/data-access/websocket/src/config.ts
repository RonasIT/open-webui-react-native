export const webSocketConfig = {
  path: '/ws/socket.io',
  transports: ['websocket'],
  // NOTE After 20 seconds after switching to the background, the socket will disconnect automatically.
  // See ping_timeout in the server param - https://python-socketio.readthedocs.io/en/stable/api.html
  pingTimeout: 20000,
};
