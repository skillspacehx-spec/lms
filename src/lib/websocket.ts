import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from './auth';

// Types
interface SocketUser {
  userId: string;
  socketId: string;
  email: string;
  name: string;
}

interface TypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface MessageEvent {
  conversationId: string;
  message: {
    _id: string;
    content: string;
    sender: {
      _id: string;
      name: string;
      avatar?: string;
    };
    receiver: {
      _id: string;
    };
    createdAt: Date;
    isRead: boolean;
    attachments?: Array<{
      url: string;
      type: string;
      fileName: string;
    }>;
  };
}

interface ReadReceiptEvent {
  conversationId: string;
  messageId: string;
  userId: string;
  readAt: Date;
}

// Store online users
const onlineUsers = new Map<string, SocketUser>();
const userSockets = new Map<string, string[]>(); // userId -> socketIds (multiple tabs)

let io: Server | null = null;

/**
 * Initialize WebSocket server
 */
export function initializeWebSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Authenticate user
    socket.on('authenticate', async (token: string) => {
      try {
        const user = verifyToken(token);
        
        // Store user mapping
        onlineUsers.set(socket.id, {
          userId: user.userId,
          socketId: socket.id,
          email: user.email,
          name: user.name
        });

        // Track multiple sockets per user
        const existingSockets = userSockets.get(user.userId) || [];
        existingSockets.push(socket.id);
        userSockets.set(user.userId, existingSockets);

        // Join user's personal room
        socket.join(`user:${user.userId}`);

        // Broadcast online status
        socket.broadcast.emit('user:online', {
          userId: user.userId,
          name: user.name
        });

        console.log(`✅ User authenticated: ${user.name} (${user.userId})`);
        
        // Send confirmation
        socket.emit('authenticated', { userId: user.userId });

      } catch (error) {
        console.error('❌ Authentication failed:', error);
        socket.emit('auth:error', { message: 'Authentication failed' });
        socket.disconnect();
      }
    });

    // Join conversation room
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`👥 Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`👋 Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Typing indicator
    socket.on('typing:start', (data: { conversationId: string }) => {
      const user = onlineUsers.get(socket.id);
      if (!user) return;

      const typingEvent: TypingEvent = {
        conversationId: data.conversationId,
        userId: user.userId,
        userName: user.name,
        isTyping: true
      };

      // Broadcast to others in conversation
      socket.to(`conversation:${data.conversationId}`).emit('typing:update', typingEvent);
    });

    socket.on('typing:stop', (data: { conversationId: string }) => {
      const user = onlineUsers.get(socket.id);
      if (!user) return;

      const typingEvent: TypingEvent = {
        conversationId: data.conversationId,
        userId: user.userId,
        userName: user.name,
        isTyping: false
      };

      socket.to(`conversation:${data.conversationId}`).emit('typing:update', typingEvent);
    });

    // New message (called after saving to DB)
    socket.on('message:new', (data: MessageEvent) => {
      // Broadcast to conversation room
      socket.to(`conversation:${data.conversationId}`).emit('message:received', data.message);
      
      // Also send to receiver's personal room (for notifications)
      io?.to(`user:${data.message.receiver._id}`).emit('notification:message', {
        conversationId: data.conversationId,
        sender: data.message.sender,
        preview: data.message.content.substring(0, 50)
      });

      console.log(`📨 New message in conversation ${data.conversationId}`);
    });

    // Message read receipt
    socket.on('message:read', (data: ReadReceiptEvent) => {
      const user = onlineUsers.get(socket.id);
      if (!user) return;

      // Broadcast read receipt to conversation
      socket.to(`conversation:${data.conversationId}`).emit('message:read', {
        messageId: data.messageId,
        userId: user.userId,
        readAt: new Date()
      });

      console.log(`✓✓ Message ${data.messageId} read by ${user.userId}`);
    });

    // Multiple messages read (bulk)
    socket.on('messages:read:bulk', (data: { conversationId: string; messageIds: string[] }) => {
      const user = onlineUsers.get(socket.id);
      if (!user) return;

      socket.to(`conversation:${data.conversationId}`).emit('messages:read', {
        messageIds: data.messageIds,
        userId: user.userId,
        readAt: new Date()
      });
    });

    // User disconnect
    socket.on('disconnect', () => {
      const user = onlineUsers.get(socket.id);
      
      if (user) {
        // Remove this socket from user's socket list
        const sockets = userSockets.get(user.userId) || [];
        const updatedSockets = sockets.filter(id => id !== socket.id);
        
        if (updatedSockets.length > 0) {
          // User still has other tabs open
          userSockets.set(user.userId, updatedSockets);
        } else {
          // User completely offline
          userSockets.delete(user.userId);
          
          // Broadcast offline status
          socket.broadcast.emit('user:offline', {
            userId: user.userId,
            name: user.name
          });
        }
        
        onlineUsers.delete(socket.id);
        console.log(`🔌 User disconnected: ${user.name} (${socket.id})`);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });

  console.log('✅ WebSocket server initialized');
  return io;
}

/**
 * Get Socket.io server instance
 */
export function getIO(): Server | null {
  return io;
}

/**
 * Check if user is online
 */
export function isUserOnline(userId: string): boolean {
  return userSockets.has(userId) && (userSockets.get(userId)?.length || 0) > 0;
}

/**
 * Get online users count
 */
export function getOnlineUsersCount(): number {
  return userSockets.size;
}

/**
 * Get all online user IDs
 */
export function getOnlineUserIds(): string[] {
  return Array.from(userSockets.keys());
}

/**
 * Emit event to specific user (all their sockets/tabs)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function emitToUser(userId: string, event: string, data: any): void {
  if (!io) {
    console.warn('⚠️ WebSocket server not initialized');
    return;
  }
  
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit event to conversation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function emitToConversation(conversationId: string, event: string, data: any): void {
  if (!io) {
    console.warn('⚠️ WebSocket server not initialized');
    return;
  }
  
  io.to(`conversation:${conversationId}`).emit(event, data);
}

/**
 * Broadcast to all connected clients
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function broadcast(event: string, data: any): void {
  if (!io) {
    console.warn('⚠️ WebSocket server not initialized');
    return;
  }
  
  io.emit(event, data);
}
