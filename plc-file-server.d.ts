export interface PLCFileServerSettings {
    port: number;
    getRootFolder: string;
    putRootFolder: string;
}
export declare class PLCFileServer {
    /**
     * Static function that starts an Express server listening to get and put requests from a PLC
     * @param settings
     */
    static startFileServer(settings: PLCFileServerSettings): void;
}
