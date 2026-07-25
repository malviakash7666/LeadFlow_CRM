let io;

export const initSocket = (socketIoInstance) => {
  io = socketIoInstance;
};

export const getSocket = () => io;

export const sendNotification = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};
