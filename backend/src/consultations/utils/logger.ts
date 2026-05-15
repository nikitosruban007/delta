import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsultationsLogger {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log('[consultations] INFO', message, meta ?? '');
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn('[consultations] WARN', message, meta ?? '');
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error('[consultations] ERROR', message, meta ?? '');
  }
}
