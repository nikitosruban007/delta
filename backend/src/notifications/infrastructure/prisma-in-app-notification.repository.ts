import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InAppNotification } from '../domain/in-app-notification.entity';
import { InAppNotificationRepository } from '../application/ports/in-app-notification.repository';

type Row = {
  id: number;
  user_id: number | null;
  title: string | null;
  body: string | null;
  is_read: boolean | null;
  created_at: Date | null;
};

function toEntity(row: Row): InAppNotification {
  return new InAppNotification({
    id: String(row.id),
    recipientId: row.user_id ? String(row.user_id) : '',
    subject: row.title ?? '',
    body: row.body ?? '',
    isRead: row.is_read ?? false,
    createdAt: row.created_at ?? new Date(),
    readAt: null,
  });
}

@Injectable()
export class PrismaInAppNotificationRepository extends InAppNotificationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(notification: InAppNotification): Promise<void> {
    const props = notification.toObject();
    const recipient = Number(props.recipientId);
    if (!Number.isInteger(recipient) || recipient <= 0) {
      throw new Error('Invalid recipientId for notification');
    }
    // If id is numeric, treat as upsert; otherwise create new and let DB assign id.
    const numericId = Number(props.id);
    if (Number.isInteger(numericId) && numericId > 0) {
      await this.prisma.notifications.upsert({
        where: { id: numericId },
        create: {
          id: numericId,
          user_id: recipient,
          title: props.subject,
          body: props.body,
          is_read: props.isRead,
          created_at: props.createdAt,
        },
        update: {
          user_id: recipient,
          title: props.subject,
          body: props.body,
          is_read: props.isRead,
        },
      });
      return;
    }
    const row = await this.prisma.notifications.create({
      data: {
        user_id: recipient,
        title: props.subject,
        body: props.body,
        is_read: props.isRead,
        created_at: props.createdAt,
      },
    });
    // Mutate the entity id so subsequent updates target the correct row
    (notification as unknown as { props: { id: string } }).props.id = String(
      row.id,
    );
  }

  async update(notification: InAppNotification): Promise<void> {
    const props = notification.toObject();
    const id = Number(props.id);
    if (!Number.isInteger(id) || id <= 0) return;
    await this.prisma.notifications.update({
      where: { id },
      data: {
        is_read: props.isRead,
        title: props.subject,
        body: props.body,
      },
    });
  }

  async findById(id: string): Promise<InAppNotification | null> {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) return null;
    const row = await this.prisma.notifications.findUnique({
      where: { id: numericId },
    });
    return row ? toEntity(row) : null;
  }

  async findByRecipient(recipientId: string): Promise<InAppNotification[]> {
    const recipient = Number(recipientId);
    if (!Number.isInteger(recipient) || recipient <= 0) return [];
    const rows = await this.prisma.notifications.findMany({
      where: { user_id: recipient },
      orderBy: { id: 'desc' },
      take: 100,
    });
    return rows.map((r) => toEntity(r));
  }
}
