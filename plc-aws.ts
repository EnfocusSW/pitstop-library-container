import * as fs from "fs";
import * as AWS from "aws-sdk";
import { SQSClient, SendMessageCommand, SendMessageCommandInput, SQSClientConfig } from "@aws-sdk/client-sqs";
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

export class PLCAWS {
  static s3Instance: any;
  static settings: PLCAWSSettings;

  static init(options: PLCAWSSettings) {
    //define default settings
    PLCAWS.settings = options;
    if (options.region == undefined) {
      PLCAWS.settings.region = "eu-west-1";
    }
    if (PLCAWS.settings.sqsQueueURL == undefined) {
      PLCAWS.settings.sqsQueueURL = "";
    }
    if (PLCAWS.settings.expirationTime == undefined) {
      PLCAWS.settings.expirationTime = 15 * 60; //15 minutes
    }

    //configure and instantiate AWS
    AWS.config.update({
      accessKeyId: PLCAWS.settings.accessKeyId,
      secretAccessKey: PLCAWS.settings.secretAccessKey,
      region: PLCAWS.settings.region,
    });
    PLCAWS.s3Instance = new AWS.S3();
  }

  static async uploadToS3AndSign(filePath: string, s3Key: string): Promise<string> {
    try {
      const uploadResponse = await PLCAWS.uploadToS3(filePath, s3Key);
      const signedURL = await PLCAWS.getPresignedURL(s3Key, "getObject");
      return signedURL as string;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Static function to upload a file to an S3 bucket
   * @param filePath
   * @param outputPath
   * @returns
   */
  static async uploadToS3(filePath: string, s3Key: string): Promise<s3UploadResponse> {
    const readStream = fs.createReadStream(filePath);

    const params = {
      Bucket: PLCAWS.settings.bucketName,
      Key: s3Key,
      Body: readStream,
    };

    return new Promise((resolve, reject) => {
      this.s3Instance.upload(params, function (err: any, data: any) {
        readStream.destroy();
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  /**
   * Static function to get a presigned URL for a location on S3
   * @param s3Location
   * @param method
   * @returns
   */
  static async getPresignedURL(s3Key: string, method: "getObject" | "putObject") {
    const params = {
      Bucket: PLCAWS.settings.bucketName,
      Key: s3Key,
      Expires: PLCAWS.settings.expirationTime,
    };
    try {
      const presignedURL = PLCAWS.s3Instance.getSignedUrl(method, params);
      return presignedURL;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Static function to download a file from an S3 bucket
   */
  static async downloadFromS3(s3Key: string, outputPath: string): Promise<string> {
    const params = {
      Bucket: PLCAWS.settings.bucketName,
      Key: s3Key,
    };

    let writeStream = fs.createWriteStream(outputPath);

    return new Promise<any>((resolve, reject) => {
      const readStream = PLCAWS.s3Instance.getObject(params).createReadStream();

      // Error handling in read stream
      readStream.on("error", (e: Error) => {
        reject(e);
      });

      // Resolve only if we are done writing
      writeStream.once("finish", () => {
        return resolve(params.Key);
      });

      // pipe will automatically finish the write stream once done
      readStream.pipe(writeStream);
    });
  }

  /**0
   * Static function to submit the data for the PLC via AWS SQS
   * @param data
   */
  static async submitToSQS(data: PLCJobOptions): Promise<string> {
    if (PLCAWS.settings.sqsQueueURL == undefined || PLCAWS.settings.sqsQueueURL == "") {
      throw new Error("The url of the SQS queue is not defined");
    }
    try {
      const bodyData = JSON.stringify(data);
      const input: SendMessageCommandInput = { QueueUrl: PLCAWS.settings.sqsQueueURL, MessageBody: bodyData };
      const config: SQSClientConfig = {
        credentials: { accessKeyId: PLCAWS.settings.accessKeyId, secretAccessKey: PLCAWS.settings.secretAccessKey },
      };
      const client = new SQSClient(config);
      const command = new SendMessageCommand(input);
      const response = await client.send(command);
      if (response.MessageId !== undefined) {
        return response.MessageId;
      } else {
        throw new Error("AWS did not return a valid message id");
      }
    } catch (error) {
      throw error;
    }
  }
}
