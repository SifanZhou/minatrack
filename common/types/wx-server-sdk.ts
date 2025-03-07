export interface WxContext {
  OPENID?: string;
  APPID?: string;
  UNIONID?: string;
  ENV?: string;
  SOURCE?: string;
}

export interface ICloud {
  database(): Database;
  init(config?: { env?: string }): void;
  getWXContext(): WxContext;
}

export interface Database {
  collection(name: string): Collection;
  command: any;
  startTransaction(): Promise<Transaction>;
}

export interface Transaction {
  collection(name: string): Collection;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface Collection {
  doc(id: string): Document;
  where(condition: any): Query;
  orderBy(fieldPath: string, order: 'asc' | 'desc'): Query;
  limit(max: number): Query;
  skip(offset: number): Query;
  field(object: object): Query;
  get(): Promise<IQueryResult>;
  add(options: { data: any }): Promise<IAddResult>;
}

export interface Document {
  get(): Promise<IDocumentResult>;
  update(options: { data: any }): Promise<IUpdateResult>;
  set(options: { data: any }): Promise<ISetResult>;
  remove(): Promise<IRemoveResult>;
}

export interface Query {
  get(): Promise<IQueryResult>;
  count(): Promise<ICountResult>;
}

export interface IQueryResult {
  data: any[];
  errMsg?: string;
}

export interface IDocumentResult {
  data: any;
  errMsg?: string;
}

export interface IAddResult {
  _id: string;
  errMsg?: string;
}

export interface IUpdateResult {
  stats: {
    updated: number;
  };
  errMsg?: string;
}

export interface ISetResult {
  _id: string;
  stats: {
    updated: number;
    created: number;
  };
  errMsg?: string;
}

export interface IRemoveResult {
  stats: {
    removed: number;
  };
  errMsg?: string;
}

export interface ICountResult {
  total: number;
  errMsg?: string;
}

export interface IQuerySingleResult {
  data: any;
  errMsg?: string;
}