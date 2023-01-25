/**
 * Export of the interface of the options required for the creation of a variable set
 */
export interface PLCEVSOptions {
    variables: {
        name: string;
        type: "Number" | "String" | "Boolean" | "Length";
        value: string | number | boolean;
    }[];
    units: "mm" | "in" | "cm" | "pt";
    outputPath: string;
}
export declare class PLCEVS {
    /**
     * Based on a simple object the variable set file is created and saved in the output folder
     * @param values
     */
    static createVariableSet: (options: PLCEVSOptions) => void;
}
