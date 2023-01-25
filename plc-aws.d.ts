import { PLCJobOptions } from "./plc-job";
export interface s3UploadResponse {
    Location: string;
    Bucket: string;
    Key: string;
    ETag: string;
}
export interface PLCAWSSettings {
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    region?: string;
    sqsQueueURL?: string;
    expirationTime?: number;
}
export declare class PLCAWS {
    static s3Instance: any;
    static settings: PLCAWSSettings;
    static init(options: PLCAWSSettings): void;
    static uploadToS3AndSign(filePath: string, s3Key: string): Promise<string>;
    /**
     * Static function to upload a file to an S3 bucket
     * @param filePath
     * @param outputPath
     * @returns
     */
    static uploadToS3(filePath: string, s3Key: string): Promise<s3UploadResponse>;
    /**
     * Static function to get a presigned URL for a location on S3
     * @param s3Location
     * @param method
     * @returns
     */
    static getPresignedURL(s3Key: string, method: "getObject" | "putObject"): Promise<any>;
    /**
     * Static function to download a file from an S3 bucket
     */
    static downloadFromS3(s3Key: string, outputPath: string): Promise<string>;
    /**0
     * Static function to submit the data for the PLC via AWS SQS
     * @param data
     */
    static submitToSQS(data: PLCJobOptions): Promise<string>;
}
