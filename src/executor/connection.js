// @flow

// TODO hardcoded domain name
export const ORIGIN = __DEV__ ? 'http://localhost:3000' : 'https://ide.pria.at';

export type IdeMessage = {
  command: string,
  payload: any,
};

export interface Connection {
  send(command: string, payload: any): void;
  recv(): Promise<any>;
}

class Conn implements Connection {
  source: window | null = null;
  resolvers: Array<{|
    resolve: any => void,
    reject: any => void,
  |}> = [];

  setSource(source: window) {
    // eslint-disable-next-line no-throw-literal
    if (this.source !== null) throw 'source already initialized';

    this.source = source;
  }

  send(command: string, payload: any) {
    // eslint-disable-next-line no-throw-literal
    if (this.source === null) throw 'send without source';

    this.source.postMessage({ command, payload }, ORIGIN);
  }

  recv(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resolvers.push({ resolve, reject });
    });
  }

  handleReply(value: any) {
    const { resolve } = this.resolvers.shift();
    resolve(value);
  }

  handleErrorReply(error: any) {
    const { reject } = this.resolvers.shift();
    reject(error);
  }
}

const connection = new Conn();
export default connection;
