const cloud = require('wx-server-sdk');

interface QueryOptions {
  collection: string;
  where?: Record<string, any>;
  limit?: number;
  skip?: number;
  orderBy?: string | Record<string, 'asc' | 'desc'>;
  orderDirection?: 'asc' | 'desc';
}

interface AddOptions {
  collection: string;
  data: Record<string, any>;
}

class Database {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async query(options: QueryOptions) {
    try {
      let query = this.db.collection(options.collection);
      
      if (options.where) {
        query = query.where(options.where);
      }
      
      if (options.orderBy) {
        query = query.orderBy(options.orderBy, options.orderDirection || 'asc');
      }
      
      if (options.skip) {
        query = query.skip(options.skip);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      return await query.get();
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async add(options: AddOptions) {
    try {
      return await this.db.collection(options.collection).add({
        data: options.data
      });
    } catch (error) {
      console.error('Database add error:', error);
      throw error;
    }
  }

  collection(name: string) {
    return this.db.collection(name);
  }
}

// 导出数据库实例
let dbInstance: Database | null = null;

export function initDb() {
  if (!dbInstance) {
    cloud.init();
    dbInstance = new Database(cloud.database());
  }
  return dbInstance;
}

export const db = initDb();