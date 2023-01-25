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
    //the input file is a local file that is uploaded and signed
    inputFileURL = await PLCAWS.uploadToS3AndSign(inputFile, "input/" + baseName);
    //the Action List file is already on the bucket and only has to be signed as getObject
    actionListURL = await PLCAWS.getPresignedURL(`actionlists/Convert all RGB to CMYK.eal`, "getObject");
    //the output files do not exist yet, so pre-signed URLs as a putObject have to be generated
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
