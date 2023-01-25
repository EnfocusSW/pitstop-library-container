import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Export of the interface for the options when constructing a new instance of the PLC class
 */
export interface PLCJobOptions {
  inputFileURL: string;
  outputFixedFileURL?: string;
  reference: string;
  profileURL?: string;
  actionListURLs?: string[];
  variableSetURL?: string[];
  jobTicketURL?: string;
  extrafontsFolderURL?: string[];
  jobStatusURL?: string; // "http://localhost:8080/result",
  reportProgress?: boolean;
  progressMinFraction?: number; //0.05;
  reportURLs: {
    JSON?: string;
    XML?: string;
    PDF?: string;
  };
  reportTemplate?: {
    configFileURL: string;
    templateFileURL: string;
  };
  reportLanguage?: "enUS" | "deDE" | "esES" | "frFR" | "itIT" | "nlNL" | "jaJA" | "zhCN" | "plPL" | "ptBR"; // "enUS",
  maxItemsPerCategory?: number; //default:  100,
  maxNumOccurrencesPerItem?: number; //default: 100,
  colorManagement?: {
    images: {
      sourceProfiles: {
        profileGray?: {
          url: string; // "presigned url of Generic Enfocus gray.icm"
        };
        profileRGB?: {
          url: string; // "presigned url of Generic Enfocus RGB.icm"
        };
        profileCMYK?: {
          url: string; // "presigned url of Generic Enfocus CMYK.icm"
        };
        profileLabPath?: {
          url: string; // "presigned url of Generic Enfocus Lab.icm"
        };
        intentOverrides?: boolean; // false
      };
      targetProfiles: {
        profileGray?: {
          url: string; //"presigned url of Generic Enfocus gray.icm"
        };
        profileRGB?: {
          url: string; //"presigned url of Generic Enfocus RGB.icm"
        };
        profileCMYK?: {
          url: string; //presigned url of Generic Enfocus CMYK.icm"
        };
        profileLabPath?: {
          url: string; //presigned url of Generic Enfocus Lab.icm"
        };
        intentOverrides?: boolean; // false
      };
      renderingIntent?: "objectDefined" | "relativeColorimetric" | "absoluteColorimetric" | "saturation" | "perceptual"; // "objectDefined"
    };
    blackPointCompensation?: boolean; //false
  };
  flattening?: {
    rasterToVectorRatio?: number; // 100,
    lineArtAndTextResolution?: number; // 1200,
    gradientAndMeshResolution?: number; // 300,
    textToOutlines?: boolean; // false,
    strokesToOutlines?: boolean; // false,
    clipComplexRegions?: boolean; // false,
    preserveOverprint?: boolean; // true,
    blendingColorSpace?: {
      path?: string;
      name: "DeviceRGB" | "DeviceCMYK" | "DeviceGray" | "ColorManagement";
    };
    removeICCProfile?: boolean; // true,
    recompressImages?: {
      colorImage: {
        format: "JPEG" | "JPEG2000" | "ZIP";
        quality: "Minimum" | "Low" | "Medium" | "High" | "Maximum" | "Lossless" | "4-bit" | "8-bit";
        grayscaleImage?: {
          format: "JPEG" | "JPEG2000" | "ZIP";
          quality: "Minimum" | "Low" | "Medium" | "High" | "Maximum" | "Lossless" | "4-bit" | "8-bit";
        };
        oneBitImage: {
          format: "ZIP" | "CCITT Group 3" | "CCITT Group 4" | "RunLength";
        };
        asciiFilter: "ASCII hex" | "ASCII 85";
      };
    };
  };
}
