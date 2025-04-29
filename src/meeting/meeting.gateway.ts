import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MeetingService } from './meeting.service';
import { Logger } from '@nestjs/common';
import { WebSocketUtils } from 'src/common/utils/websocket.utils';

@WebSocketGateway()
export class MeetingGateway {
  private readonly logger = new Logger(MeetingGateway.name);

  constructor(private readonly meetingService: MeetingService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('createMeeting')
  async handleCreateMeeting(
    @MessageBody() body: string,
    @ConnectedSocket() client: Socket,
  ) {
    let meetingData: { userId: string; title: string };

    try {
      meetingData = WebSocketUtils.parseBody(body);
      WebSocketUtils.validateFields(meetingData, ['userId']);
    } catch (err) {
      this.logger.error(`Validation error: ${err.message}`);
      return WebSocketUtils.safeEmit(client, 'error', {
        status: 400,
        message: err.message,
      });
    }

    const { userId, title } = meetingData;

    try {
      const meeting = await this.meetingService.createMeeting(userId, title);
      const code = meeting.code;

      client.join(code);
      this.server.to(code).emit('meetingCreated', { code });
      this.logger.log(`Meeting created: ${code} | Host: ${userId}`);
    } catch (err) {
      this.logger.error(`Service error during createMeeting: ${err.message}`);
      return WebSocketUtils.safeEmit(client, 'error', {
        status: 500,
        message: err.message || 'Failed to create meeting',
      });
    }
  }

  @SubscribeMessage('joinMeeting')
  async handleJoinMeeting(
    @MessageBody() body: string,
    @ConnectedSocket() client: Socket,
  ) {
    let meetingData: { code: string; userId: string };

    try {
      meetingData = WebSocketUtils.parseBody(body);
      WebSocketUtils.validateFields(meetingData, ['code', 'userId']);
    } catch (err) {
      this.logger.error(`Validation error: ${err.message}`);
      return WebSocketUtils.safeEmit(client, 'error', {
        status: 400,
        message: err.message,
      });
    }

    const { code, userId } = meetingData;

    try {
      await this.meetingService.joinMeeting(code, userId);

      client.join(code);
      this.server.to(code).emit('userJoined', { userId });

      this.logger.log(`User ${userId} joined meeting ${code}`);
    } catch (err) {
      this.logger.error(`Service error during joinMeeting: ${err.message}`);
      return WebSocketUtils.safeEmit(client, 'error', {
        status: 500,
        message: err.message || 'Failed to join meeting',
      });
    }
  }

  @SubscribeMessage('leaveMeeting')
  async handleLeaveMeeting(
    @MessageBody() body: string,
    @ConnectedSocket() client: Socket,
  ) {
    let meetingData: { code: string; userId: string };

    try {
      meetingData = WebSocketUtils.parseBody(body);
      WebSocketUtils.validateFields(meetingData, ['code', 'userId']);
    } catch (err) {
      this.logger.error(`Validation error: ${err.message}`);
      return WebSocketUtils.safeEmit(client, 'error', {
        status: 400,
        message: err.message,
      });
    }

    const { code, userId } = meetingData;

    try {
      await this.meetingService.leaveMeeting(code, userId);

      client.leave(code);
      this.server.to(code).emit('userLeft', { userId });

      this.logger.log(`User ${userId} left meeting ${code}`);
    } catch (err) {
      this.logger.error(`Error leaving meeting: ${err.message}`);
      return WebSocketUtils.safeEmit(client, 'error', {
        status: 500,
        message: 'Failed to leave meeting',
      });
    }
  }

  @SubscribeMessage('endMeeting')
  async handleEndMeeting(
    @MessageBody() body: string,
    @ConnectedSocket() client: Socket,
  ) {
    let meetingData: { code: string; userId: string };

    try {
      meetingData = WebSocketUtils.parseBody(body);
      WebSocketUtils.validateFields(meetingData, ['code', 'userId']);
    } catch (err) {
      this.logger.error(`Validation error: ${err.message}`);
      return WebSocketUtils.safeEmit(client, 'error', {
        status: 400,
        message: err.message,
      });
    }

    const { code, userId } = meetingData;

    try {
      await this.meetingService.leaveMeeting(code, userId);
      await this.meetingService.endMeeting(code);
      client.leave(code);
      this.server.to(code).emit('meetingEnded', { code });
      this.logger.log(`Meeting ended: ${code} | Host: ${userId}`);
    } catch (err) {
      this.logger.error(`Service error during endMeeting: ${err.message}`);
      return WebSocketUtils.safeEmit(client, 'error', {
        status: 500,
        message: err.message || 'Failed to end meeting',
      });
    }
  }
}
