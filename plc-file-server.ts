const express = require("express");
const app = express();
const fs = require("fs");
const { Http2ServerRequest } = require("http2");
const { resolve } = require("path");
const path = require("path");

export interface PLCFileServerSettings {
  port: number;
  getRootFolder: string;
  putRootFolder: string;
}

export class PLCFileServer {
  /**
   * Static function that starts an Express server listening to get and put requests from a PLC
   * @param settings
   */
  static startFileServer(settings: PLCFileServerSettings) {
    /**
     * Function to stream the file that comes in via PUT to a file on the file server
     * @param {*} req
     * @param {*} filePath
     * @returns
     */
    const putFile = (req: any, filePath: any) => {
      return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(filePath);
        const startTime = new Date().getTime();
        const totalBytes = parseInt(req.headers["content-length"]);

        //start
        stream.on("open", () => {
          console.log(`Putting ${filePath} ${new Date().toISOString()}`);
          req.pipe(stream);
        });

        //finish
        stream.on("close", () => {
          const endTime = new Date().getTime();
          const processingTime = endTime - startTime;
          const processingSpeed = (totalBytes / 1024 / 1024 / (processingTime / 1000)).toFixed(2);
          console.log(``);
          console.log(`  File  : ${filePath}`);
          console.log(`  Size  : ${(totalBytes / 1024 / 1024).toFixed(2)} Mb`);
          console.log(`  Time  : ${(processingTime / 1000).toFixed(3)} sec`);
          console.log(`  Speed : ${processingSpeed} Mb/sec`);
          console.log(``);
          resolve(filePath);
        });

        // If something goes wrong, reject the promise
        stream.on("error", (err: any) => {
          console.error(err);
          reject(err);
        });
      });
    };

    /**
     * Set up the web server to serve the input files via GET
     * Any path that starts at the root and points to an existing file will work
     */
    app.get(/\/.+/, (req: any, res: any, next: any) => {
      const filePath = settings.getRootFolder.replace(/\/$/, "") + decodeURIComponent(req.path);
      console.log(`Getting ${filePath} ${new Date().toISOString()}`);

      //check if the requested file exists
      if (fs.existsSync(filePath) == false) {
        throw new Error(`The file ${filePath} does not exist`);
      } else {
        const totalBytes = fs.statSync(filePath).size;
        const startTime = new Date().getTime();

        res.download(filePath, (err: any) => {
          if (err) {
            throw new Error(`Error getting ${filePath}`);
          } else {
            const endTime = new Date().getTime();
            const processingTime = endTime - startTime;
            const processingSpeed = (totalBytes / 1024 / 1024 / (processingTime / 1000)).toFixed(2);
            console.log(``);
            console.log(`  File  : ${filePath}`);
            console.log(`  Size  : ${(totalBytes / 1024 / 1024).toFixed(2)} Mb`);
            console.log(`  Time  : ${(processingTime / 1000).toFixed(3)} sec`);
            console.log(`  Speed : ${processingSpeed} Mb/sec`);
            console.log(``);
          }
        });
      }
    });

    /**
     * Add a route to accept incoming put requests for the file upload.
     * Any path is accepted and a matching subfolder structure is created if necessary
     *
     */
    app.put(/\/.+/, (req: any, res: any) => {
      let reqPathSegments = req.path.split("/");
      for (let i = 0; i < reqPathSegments.length; i++) {
        reqPathSegments[i] = decodeURIComponent(reqPathSegments[i]);
      }
      const fileName = reqPathSegments.reverse().shift();
      if (reqPathSegments.length > 1) {
        const subFolders = reqPathSegments.reverse().join("/");
        if (fs.existsSync(path.join(settings.putRootFolder, subFolders)) == false) {
          console.log(`Creating ${subFolders}`);
          fs.mkdirSync(path.join(settings.putRootFolder, subFolders), { recursive: true });
        }
      }
      const filePath = path.join(settings.putRootFolder, reqPathSegments.join("/") + "/" + fileName);
      putFile(req, filePath)
        .then((path) => res.send({ status: "success", path }))
        .catch((err) => res.send({ status: "error", err }));
    });

    /**
     * Mount the app to a port
     */
    app.listen(settings.port, () => {
      console.log(`Server running on port ${settings.port}`);
    });
  }
}
