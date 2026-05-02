import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotificationChannel } from '../../domain/notification-channel.enum';
import {
  DispatchNotificationDto,
  DispatchRecipientDto,
} from './dispatch-notification.dto';

describe('DispatchNotificationDto', () => {
  it('validates a full dispatch notification payload', async () => {
    const dto = plainToInstance(DispatchNotificationDto, {
      recipients: [{ userId: 'user-1', email: 'user@example.com' }],
      subject: 'Subject',
      body: 'Body',
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    });

    expect(dto.recipients[0]).toBeInstanceOf(DispatchRecipientDto);
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects empty recipients, empty text fields and unsupported channels', async () => {
    const dto = plainToInstance(DispatchNotificationDto, {
      recipients: [],
      subject: '',
      body: '',
      channels: ['SMS'],
    });

    await expect(validate(dto)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'recipients' }),
        expect.objectContaining({ property: 'subject' }),
        expect.objectContaining({ property: 'body' }),
        expect.objectContaining({ property: 'channels' }),
      ]),
    );
  });

  it('validates nested recipient fields', async () => {
    const dto = plainToInstance(DispatchNotificationDto, {
      recipients: [{ userId: '', email: 'not-an-email' }],
      subject: 'Subject',
      body: 'Body',
      channels: [NotificationChannel.EMAIL],
    });

    const errors = await validate(dto);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'recipients',
          children: expect.arrayContaining([
            expect.objectContaining({
              children: expect.arrayContaining([
                expect.objectContaining({ property: 'userId' }),
                expect.objectContaining({ property: 'email' }),
              ]),
            }),
          ]),
        }),
      ]),
    );
  });
});
