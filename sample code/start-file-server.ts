import { PLCFileServer } from "pitstop-library-container/plc-file-server";

PLCFileServer.startFileServer({
  port: 3000,
  getRootFolder: "E:/path/to/the/root/folder/for/getting files",
  putRootFolder: "F:/path/to/the/root/folder/for/putting files",
});
