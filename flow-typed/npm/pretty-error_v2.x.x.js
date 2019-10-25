// flow-typed signature: 4eccb7bf85eafd22d6e6a2f9f50944dc
// flow-typed version: c6154227d1/pretty-error_v2.x.x/flow_>=v0.25.x <=v0.103.x

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
