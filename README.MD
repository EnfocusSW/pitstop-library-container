# PitStop Library Container

The purpose of this package is to provide a set of tools that make it easier to build an integration with a PitStop Library Container (PLC), a docker-based version of the Enfocus PitStop Library.

Knowledge of installing and configuring a PLC environment, be it locally or hosted on Amazon AWS, is a prerequisite.

The package implements a couple of classes:

- PLCFileServer
- PLCJob
- PLCAWS
- PLCEVS

and matching interfaces:

- PLCFileServerSettings
- PLCJobOptions
- PLCAWSSettings
- PLCEVSOptions

All code samples are in TypeScript and must be transpiled before running them.

## Installation:

```javascript
npm i @enfocussw/pitstop-library-container
```

There is no need to install the typings separately.

## PLCFileServer class

When a PLC is running in a local environment and not hosted in the cloud, the most efficient approach is to mount the local file system in the docker. However, if the local PLC setup is for development purposes it can be handy to also have a local file server to handle the get and put requests of the PLC using http. A local PLC can also get and put its files on an S3 bucket, but having a local file server is of course a lot quicker. This class has a static function to start such a local file server.

- startFileServer(settings: PLCFileServerSettings)

The PLCFileServerSettings interface takes the following properties:

| Option        | Type   | Description                                                             |
| ------------- | ------ | ----------------------------------------------------------------------- |
| port          | number | The port number on which the file server will be listening              |
| getRootFolder | string | The path to the local folder that is the root folder for getting files  |
| putRootFolder | string | The path to the local folder that is the root folder for puttting files |

The protocol used is http.

The file server will run on localhost, but consider that what is localhost for the integration code is not localhost for the PLC. The address to be used is host.docker.internal.

Assume a local file path "/Users/somebody/localfileserver/input files/605612/input 1.pdf" with the getRootFolder defined as ""/Users/somebody/localfileserver/input files" and the port number defined as 3000, the URL to get the input file would be `http://host.docker.internal:3000/605612/input%201.pdf`. Note that the folders and files of the path have to be URI encoded.

When putting a file to a path that includes folders that do not exist on the local file system, these folders will be created.

It is best to laumch the local file server in its separate Command prompt/Terminal window. The file server logs all incoming requests on stdout. Running the file server separately ensures that the log messages are not mixed up with messages of other classes which is easier for troubleshooting. All the code you need is this:

```javascript
import { PLCFileServer } from "pitstop-library-container/plc-file-server";

PLCFileServer.startFileServer({
  port: 3000,
  getRootFolder: "/Users/somebody/localfileserver/input files",
  putRootFolder: "/Users/somebody/localfileserver/output files",
});
```

## PLCJob class

The PLCJob class only exports an interface for correctly building the JSON that is submitted to a PLC.

```javascript
import { PLCJobOptions } from "pitstop-library-container/plc-job";

//create the job options and submit to the queue
const jobOptions: PLCJobOptions = {
  reference: "a string that can be used to identify the job",
  inputFileURL: "URL to the input file",
  actionListURLs: ["URL to Action List 1", "URL to Action List 2"],
  reportURLs: { JSON: "URL to JSON report" },
  outputFixedFileURL: "URL to preflighted file",
  reportProgress: false,
  reportLanguage: "itIT",
};
```

For the complete documentation of the job options, refer to the Swagger UI of the PLC. In the section of the "/job" API call there is an Example Value and next to that is the Schema where all is revealed.

## PLCAWS class

It will be common for a PLC to be hosted in the cloud, e.g. on Amazon ECS. In such a setup it is logical that the input files and output files will be hosted on an S3 bucket and that the AWS SQS (Simple Queue Service) will be used for queueing jobs to the PLC workers.

The PLCAWS class offers a set of easy-to-use functions for uploading to and downloading from an S3 bucket, for generating pre-signed urls and for submitting messages to an SQS queue. All functions are static and all functions throw an error in case of a problem.

- init(settings: PLCAWSSettings)

This static method initializes the configuration for communication with AWS. The PLCAWSSettings interface has the following properties:

| Option          | Type   | Mandatory | Description                                                                                 |
| --------------- | ------ | --------- | ------------------------------------------------------------------------------------------- |
| accessKeyId     | string | yes       | The access key id as defined for your account on the AWS console.                           |
| secretAccessKey | string | yes       | The secret access key as defined for your account.                                          |
| region          | string | no        | The AWS region where your bucket is hosted. If not defined, the default value is eu-west-1. |
| sqsQueueURL     | string | no        | The URL of the SQS queue that is defined on the AWS console for your account.               |
| expirationTime  | number | no        | Pre-signed URLs expire automatically after 15 minutes. With this setting this can be        |
|                 |        |           | changed. Read more about this below in the getPresignedURL function. The unit is seconds.   |

This function must be called before using any of the other static functions.

- uploadToS3(inputFilePath: string, s3Key: string) : Promise<s3UploadResponse>

The term used to refer to the path where a file is stored in an S3 bucket is "Key". The key is not a complete URL but a path relatvive to the root of the bucket. It will look like "input files/input 1.pdf". If the key contains folder names that do not exist, they will be created automatically. The s3UploadResponse interface has the following properties:

| Option   | Type   | Description                                                            |
| -------- | ------ | ---------------------------------------------------------------------- |
| Location | string | The URL to the file location.                                          |
| Bucket   | string | This just repeats the bucket name defined in the settings              |
| Key      | string | This just repeats the key used as the second parameter of the function |
| ETag     | string | This is the ID of the uploaded file                                    |

- uploadToS3AndSign(inputFilePath : string, s3Key: string) : Promise<string>

This function is the combination of the uploadToS3 function and the getPresignedURL function.

- getPresignedURL(s3Key: string, method: "getObject"|"putObject") : Promise<string>

The PLC does not usually have access to the S3 bucket where the files for processing are stored. AWS offers a method to generate a so-called pre-signed URL for a file on a bucket. It is a URL that gives access to the file for a limited period of time without the user of the URL having to provide credentials. These URLs expire and becomes useless. The default expiration time is 15 minutes, but the value can be defined when initializing PLCAWS (see above). When defining the expiration time, consider that preflighting can take a long time for certain types of files and also consider that the files submitted to the PLC will be queued in some way, meaning they are not necessarily picked up straight away. There could potentially be several minutes before a file starts being processed.

Pre-signed URLs can be generated for files that are already on a bucket and that are accessed by the PLC using the HTTP method "get", and for files that do not exist yet and that will be output by the PLC using "put". Choose the second parameter accordingly. Note that AWS also generates pre-signed URLs using "getObject" for files that do not exist! This means that you could successfully create a pre-signed URL for an input file that afterwards fails in the PLC

- downloadFromS3(s3Key: string, outputPath: string) : Promise<string>

The location of the file to be downloaded is the bucket key, e.g. "output/output 1.pdf", not a complete pre-signed URL. When you have a pre-signed URL it can be downloaded as is without having to use the configuration of the bucket. The outputPath is the local file path where the file will be downloaded.

- submitToSQS(data: PLCJobOptions): Promise<string>

This function submits a message to the SQS queue with the JSON as required as input for the PLC in the body. The active workers will read the messages from the SQS queue and start processing based on the JSON of the message body. The return value is the MessageId.

Sample code to a submit local file to an S3 bucket and the job options to an SQS queue.

```javascript
import * as path from "path";
import { PLCAWS } from "pitstop-library-container/plc-aws";

async function main() {
  //initialize the AWS environment
  //the values used here are not valid, they only illustrate what the real values look like
  PLCAWS.init({
    accessKeyId: "AKIARXAIJAUEC6LMMD40",
    secretAccessKey: "bT2k98YSpj4YOaNC6jJxyfK6+d32GIUpLilu",
    bucketName: "my-bucket-name",
    sqsQueueURL: "https://sqs.eu-west-1.amazonaws.com/118424572099/my-queue-name",
    expirationTime: 1800, //30 minutes
  });

  //get all the URLs of the input and output files
  let inputFile = "/Users/somebody/input files/input 1.pdf";
  const baseName = path.basename(inputFile);
  let inputFileURL, actionListURL, outputFileURL, outputReportURL;
  try {
    inputFileURL = await PLCAWS.uploadToS3AndSign(inputFile, "input/" + baseName);
    //it is assumed the Action List file is already on the bucket
    actionListURL = await PLCAWS.getPresignedURL(`actionlists/Convert all RGB to CMYK.eal`, "getObject");
    outputFileURL = await PLCAWS.getPresignedURL("output/" + baseName, "putObject");
    outputReportURL = await PLCAWS.getPresignedURL("output/" + path.basename(inputFile) + ".json", "putObject");
  } catch (error) {
    console.error(error.message);
    return;
  }

  //create the job options and submit to the queue
  const jobOptions: PLCJobOptions = {
    reference: baseName,
    inputFileURL: inputFileURL,
    actionListURLs: [actionListURL],
    reportURLs: { JSON: outputReportURL },
    outputFixedFileURL: outputFileURL,
    reportProgress: false,
    reportLanguage: "itIT",
  };
  try {
    await PLCAWS.submitToSQS(jobOptions);
  } catch (error) {
    console.error(error.message);
  }
}

main();
```

## PLCEVS class

This class has a single static function createVariableSet to facilitate the creation of an EVS file (Enfocus Variable Set) for use in the PLCJobOptions property variableSetURL. It takes the following parameters:

- variables

This is an array of objects with these mandatory properties:

| Property | Value                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| name     | The name of the variable as used in the Preflight Profile or Action List                                      |
| type     | "Number" \| "String" \| "Boolean" \| "Length"                                                                 |
| value    | The value of the variable, must be a string, a number or a boolean and correspond to the type of the variable |

- units

One of "mm", "cm", "in" or "pt".

- outputPath

A string with the path where to write the variable set.

Sample code:

```javascript
import { PLCEVS, PLCEVSOptions } from "pitstop-library-container/plc-evs";

let evsContent: PLCEVSOptions = {
  variables: [
    { name: "var1", type: "String", value: "this is a string" },
    { name: "var2", type: "Number", value: 42 },
    { name: "var3", type: "Length", value: 666 },
    { name: "var4", type: "Boolean", value: true },
  ],
  units: "mm",
  outputPath: "./test.evs",
};

PLCEVS.createVariableSet(evsContent);
```
