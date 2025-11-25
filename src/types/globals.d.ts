// Temporary type declarations for Node.js globals
declare global {
  namespace NodeJS {
    interface ReadableStream {
      setEncoding(encoding: string): void;
      on(event: string, listener: (...args: any[]) => void): ReadableStream;
    }
    
    interface WritableStream {
      write(data: string): boolean;
    }
    
    interface Process {
      uptime(): number;
      exit(code?: number): never;
      on(event: string, listener: (...args: any[]) => void): Process;
      stdin: ReadableStream;
      stdout: WritableStream;
    }
  }
  
  interface Console {
    error(...data: any[]): void;
    log(...data: any[]): void;
  }

  var process: NodeJS.Process;
  var console: Console;
}

export {};