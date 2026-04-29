export type InAppNotificationProps = {
  id: string;
  recipientId: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
};

export class InAppNotification {
  constructor(private readonly props: InAppNotificationProps) {}

  get id(): string {
    return this.props.id;
  }

  get recipientId(): string {
    return this.props.recipientId;
  }

  get subject(): string {
    return this.props.subject;
  }

  get body(): string {
    return this.props.body;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get readAt(): Date | null {
    return this.props.readAt;
  }

  markAsRead(at: Date): void {
    if (this.props.isRead) {
      return;
    }

    this.props.isRead = true;
    this.props.readAt = at;
  }

  toObject(): InAppNotificationProps {
    return { ...this.props };
  }
}
