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
