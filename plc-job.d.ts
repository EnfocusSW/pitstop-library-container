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
    jobStatusURL?: string;
    reportProgress?: boolean;
    progressMinFraction?: number;
    reportURLs: {
        JSON?: string;
        XML?: string;
        PDF?: string;
    };
    reportTemplate?: {
        configFileURL: string;
        templateFileURL: string;
    };
    reportLanguage?: "enUS" | "deDE" | "esES" | "frFR" | "itIT" | "nlNL" | "jaJA" | "zhCN" | "plPL" | "ptBR";
    maxItemsPerCategory?: number;
    maxNumOccurrencesPerItem?: number;
    colorManagement?: {
        images: {
            sourceProfiles: {
                profileGray?: {
                    url: string;
                };
                profileRGB?: {
                    url: string;
                };
                profileCMYK?: {
                    url: string;
                };
                profileLabPath?: {
                    url: string;
                };
                intentOverrides?: boolean;
            };
            targetProfiles: {
                profileGray?: {
                    url: string;
                };
                profileRGB?: {
                    url: string;
                };
                profileCMYK?: {
                    url: string;
                };
                profileLabPath?: {
                    url: string;
                };
                intentOverrides?: boolean;
            };
            renderingIntent?: "objectDefined" | "relativeColorimetric" | "absoluteColorimetric" | "saturation" | "perceptual";
        };
        blackPointCompensation?: boolean;
    };
    flattening?: {
        rasterToVectorRatio?: number;
        lineArtAndTextResolution?: number;
        gradientAndMeshResolution?: number;
        textToOutlines?: boolean;
        strokesToOutlines?: boolean;
        clipComplexRegions?: boolean;
        preserveOverprint?: boolean;
        blendingColorSpace?: {
            path?: string;
            name: "DeviceRGB" | "DeviceCMYK" | "DeviceGray" | "ColorManagement";
        };
        removeICCProfile?: boolean;
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
