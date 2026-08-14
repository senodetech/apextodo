import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(
    title: string,
    message: string,
    actorEmail: string,
    targetEmail?: string,
    type: NotificationType | string = NotificationType.MEMBER_CREATED,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      title,
      message,
      actorEmail,
      targetEmail,
      type,
      isRead: false,
    });
    return this.notificationRepository.save(notification);
  }

  async findAll(limit = 50): Promise<Notification[]> {
    return this.notificationRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { isRead: false },
    });
    return { count };
  }

  async markAsRead(id: string): Promise<Notification> {
    await this.notificationRepository.update(id, { isRead: true });
    return this.notificationRepository.findOne({ where: { id } }) as Promise<Notification>;
  }

  async markAllAsRead(): Promise<{ success: boolean }> {
    await this.notificationRepository.update({ isRead: false }, { isRead: true });
    return { success: true };
  }
}
