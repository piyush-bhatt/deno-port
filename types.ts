export interface IPortRange {
  start: number;
  end: number;
}

export interface IListenerOptions {
  port: number;
  hostname?: string;
  transport?: "tcp";
}

export interface IOptions {
  port?: number[] | IPortRange;
  hostname?: string;
  transport?: "tcp";
}
