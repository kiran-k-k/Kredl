/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-enum-comparison */
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  /**
   * Translates Mongoose readyState to human readable string
   */
  private getConnectionStateString(state: number): string {
    switch (state) {
      case 0:
        return 'disconnected';
      case 1:
        return 'connected';
      case 2:
        return 'connecting';
      case 3:
        return 'disconnecting';
      default:
        return 'unknown';
    }
  }

  /**
   * Lightweight DB Ping for real-time live monitoring
   */
  async checkLive() {
    const state = this.connection.readyState;
    const isConnected = state === 1;

    let pingMs = -1;
    let serverStatus: any = {};

    if (isConnected && this.connection.db) {
      try {
        const start = Date.now();
        await this.connection.db.admin().ping();
        pingMs = Date.now() - start;

        // Optionally fetch lightweight server status for uptime
        serverStatus = await this.connection.db.admin().serverStatus();

        this.logger.log(`Database ping successful. Latency: ${pingMs}ms`);
      } catch (error) {
        this.logger.error('Database ping failed', error.stack);
      }
    } else {
      this.logger.warn(
        `Database not connected. State: ${this.getConnectionStateString(state)}`,
      );
    }

    return {
      status: isConnected && pingMs >= 0 ? 'healthy' : 'unhealthy',
      connection: {
        state: this.getConnectionStateString(state),
        database: this.connection.name,
        pingMs,
        uptimeSec: serverStatus.uptime || 0,
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Comprehensive DB Analysis: Matches Registered Mongoose Schemas against Physical Collections
   */
  async checkFull() {
    const liveStatus = await this.checkLive();

    const registeredModels = Object.keys(this.connection.models);

    // Map registered models to their actual physical collection names defined by Mongoose
    const expectedCollections = registeredModels.map(
      (modelName) => this.connection.models[modelName].collection.name,
    );

    let physicalCollections: string[] = [];
    if (liveStatus.status === 'healthy' && this.connection.db) {
      try {
        const collections = await this.connection.db
          .listCollections()
          .toArray();
        physicalCollections = collections.map((c) => c.name);
      } catch (error) {
        this.logger.error('Failed to list physical collections', error.stack);
      }
    }

    // Consistency calculations
    const matched = expectedCollections.filter((c) =>
      physicalCollections.includes(c),
    );
    const missingInDb = expectedCollections.filter(
      (c) => !physicalCollections.includes(c),
    );
    const orphanInDb = physicalCollections.filter(
      (c) => !expectedCollections.includes(c),
    );

    if (missingInDb.length > 0) {
      this.logger.warn(
        `Missing Collections (Registered but not in DB): ${missingInDb.join(', ')}`,
      );
    }
    if (orphanInDb.length > 0) {
      this.logger.warn(
        `Orphan Collections (In DB but not registered): ${orphanInDb.join(', ')}`,
      );
    }

    return {
      ...liveStatus,
      models: {
        registered: registeredModels,
        count: registeredModels.length,
      },
      collections: {
        physical: physicalCollections,
        count: physicalCollections.length,
      },
      consistency: {
        matched,
        missingInDb,
        orphanInDb,
      },
    };
  }
}
