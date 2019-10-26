// flow-typed signature: bbc510b1f7fd7b20104201bcb26ce521
// flow-typed version: c6154227d1/pretty-error_v2.x.x/flow_>=v0.104.x

declare module "pretty-error" {
  declare class PrettyError {
    static constructor(): PrettyError;
    static start(): PrettyError;
    alias(toBeAliased: string, alias: string): this;
    appendStyle(style: Object): this;
    render(error: Error): string;
    skip(skipFn: (traceline: Object, lineNumber: number) => boolean): this;
    skipNodeFiles(): this;
    skipPackage(...packages: string[]): this;
    skipPath(path: string): this;
    start(): this;
    withoutColors(): this;
  }
  declare module.exports: Class<PrettyError>;
}
