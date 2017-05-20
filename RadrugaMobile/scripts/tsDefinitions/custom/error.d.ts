interface Error {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
    stack: string;
}