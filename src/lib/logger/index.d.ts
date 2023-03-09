export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {}

export type LogData = Record<string, unknown>

export interface Log extends LogContext {
  message: string
  data?: LogData
}

export function log(level: LogLevel, message: string, data?: LogData): Log

export type LoggerFunction = (message: string, data?: LogData) => Log;

export const logger: Record<LogLevel, LoggerFunction>;

export function errorJson (err: Error): Record<string, unknown>;
