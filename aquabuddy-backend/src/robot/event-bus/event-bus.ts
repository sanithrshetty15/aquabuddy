import { RobotEvent, RobotEventPayloads } from './events';
import { logger } from '../../utils/logger.utils';

type Listener<T = any> = (payload: T) => void | Promise<void>;

export class EventBus {
  private listeners = new Map<string, Set<Listener>>();
  private asyncListeners = new Map<string, Set<Listener>>();

  on<E extends RobotEvent>(
    event: E,
    listener: (payload: RobotEventPayloads[E]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener);
    return () => this.listeners.get(event)?.delete(listener as Listener);
  }

  onAsync<E extends RobotEvent>(
    event: E,
    listener: (payload: RobotEventPayloads[E]) => Promise<void>
  ): () => void {
    if (!this.asyncListeners.has(event)) {
      this.asyncListeners.set(event, new Set());
    }
    this.asyncListeners.get(event)!.add(listener as Listener);
    return () => this.asyncListeners.get(event)?.delete(listener as Listener);
  }

  emit<E extends RobotEvent>(
    event: E,
    payload: RobotEventPayloads[E]
  ): void {
    const syncListeners = this.listeners.get(event);
    if (syncListeners) {
      for (const listener of syncListeners) {
        try {
          (listener as (p: RobotEventPayloads[E]) => void)(payload);
        } catch (err: any) {
          logger.error(`EventBus sync error on ${event}:`, { error: err.message });
        }
      }
    }

    const asyncListeners = this.asyncListeners.get(event);
    if (asyncListeners) {
      for (const listener of asyncListeners) {
        const result = (listener as (p: RobotEventPayloads[E]) => Promise<void>)(payload);
        if (result && typeof result.then === 'function') {
          result.catch((err: any) => {
            logger.error(`EventBus async error on ${event}:`, { error: err.message });
          });
        }
      }
    }
  }

  off<E extends RobotEvent>(event: E, listener: Listener): void {
    this.listeners.get(event)?.delete(listener);
    this.asyncListeners.get(event)?.delete(listener);
  }

  removeAllListeners(event?: RobotEvent): void {
    if (event) {
      this.listeners.delete(event);
      this.asyncListeners.delete(event);
    } else {
      this.listeners.clear();
      this.asyncListeners.clear();
    }
  }

  listenerCount(event: RobotEvent): number {
    const sync = this.listeners.get(event)?.size || 0;
    const async = this.asyncListeners.get(event)?.size || 0;
    return sync + async;
  }
}

export const eventBus = new EventBus();
