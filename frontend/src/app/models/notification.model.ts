export enum NotificationType {
  MEMBER_CREATED = 'MEMBER_CREATED',
  MEMBER_UPDATED = 'MEMBER_UPDATED',
  MEMBER_DELETED = 'MEMBER_DELETED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  actorEmail: string;
  targetEmail?: string;
  type: NotificationType | string;
  isRead: boolean;
  createdAt: string;
}
