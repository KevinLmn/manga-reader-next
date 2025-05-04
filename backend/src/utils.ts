export const TOKEN_DURATION = 900;

export type MangaDexChapter = {
  id: string;
  type: string;
  attributes: {
    volume: string;
    chapter: string;
    title: string;
    translatedLanguage: string;
    externalUrl: null;
    publishAt: Date;
    readableAt: Date;
    createdAt: Date;
    updatedAt: Date;
    pages: number;
    version: number;
  };
  relationships: {
    id: string;
    type: string;
  }[];
  links?: string[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// export class ValidationError extends Error {
//   constructor(message: string, public details?: any) {
//     super(message);
//     this.name = "ValidationError";
//   }
// }

// export class FileSystemError extends Error {
//   constructor(message: string, public details?: any) {
//     super(message);
//     this.name = "FileSystemError";
//   }
// }
