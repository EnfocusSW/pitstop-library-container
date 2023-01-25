import { toXML } from "jstoxml";
import * as fs from "fs";

/**
 * Export of the interface of the options required for the creation of a variable set
 */
export interface PLCEVSOptions {
  variables: { name: string; type: "Number" | "String" | "Boolean" | "Length"; value: string | number | boolean }[];
  units: "mm" | "in" | "cm" | "pt";
  outputPath: string;
}

export class PLCEVS {
  //private options: PLCEVSOptions;

  /**
   * Based on a simple object the variable set file is created and saved in the output folder
   * @param values
   */
  static createVariableSet = (options: PLCEVSOptions) => {
    const xmlOptions = {
      header: true,
      indent: "  ",
    };

    let variableNode: Record<string, any>, variabletype: string;
    let variableNodes: Record<string, any>[] = [];
    for (let i = 0; i < options.variables.length; i++) {
      variableNode = {
        _name: "Variable",
        _content: {
          Name: options.variables[i].name,
          ResultType: options.variables[i].type,
          SourceType: "com.enfocus.variabletype.inline",
          SourceVersion: "1",
          OperatorID: (i + 1).toString(),
        },
      };
      variableNodes.push(variableNode);
    }

    let operatorNode: Record<string, any>;
    let operatorNodes: Record<string, any>[] = [];
    for (let i = 0; i < options.variables.length; i++) {
      if (options.variables[i].type == "Length") {
        //convert to points based on the units
        if (options.units == "mm") {
          options.variables[i].value = (parseFloat(options.variables[i].value.toString()) / 25.4) * 72;
        } else if (options.units == "cm") {
          options.variables[i].value = (parseFloat(options.variables[i].value.toString()) / 2.54) * 72;
        } else if (options.units == "in") {
          options.variables[i].value = parseFloat(options.variables[i].value.toString()) * 72;
        } else if (options.units == "pt") {
          options.variables[i].value = parseFloat(options.variables[i].value.toString());
        }
        if (isNaN(options.variables[i].value as number)) {
          console.warn(`The value of ${options.variables[i].name} was not a number, it is set to 0`);
          options.variables[i].value = 0;
        }
      }
      operatorNode = {
        _name: "Operator",
        _content: {
          OperatorType: "com.enfocus.operator.constant",
          GUID: (i + 1).toString(),
          OperatorData: { Value: options.variables[i].value, ValueType: "String" }, //"String" here is fixed, it is not the result type!
          OperatorVersion: 1,
        },
      };
      operatorNodes.push(operatorNode);
    }

    let evs = {
      _name: "VariableSet",
      _attrs: {
        xmlns: "http://www.enfocus.com/2012/EnfocusVariableSet",
      },
      _content: {
        Version: "1",
        Name: "variableset",
        Variables: variableNodes,
        Operators: operatorNodes,
      },
    };

    try {
      fs.writeFileSync(options.outputPath, toXML(evs, xmlOptions));
    } catch (err) {
      throw err;
    }
  };
}
