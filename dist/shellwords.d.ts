declare class Shellwords {
    split(line: string, callback?: (rawToken: string) => void): string[];
    escape(raw: string): string;
}
declare const _default: Shellwords;
export default _default;
