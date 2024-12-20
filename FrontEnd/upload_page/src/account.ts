export interface User {
  UserID?: number;
  UserName: string;
  Email: string;
  Password: string;
  ProfilePicture?: string;
}

export interface Note {
  NoteID: number;
  Topic: string;
  Content: string;
  UploadDate: Date;
  UserID: number;
  YearLevelID: number;
  SubjectID: number;
}

export interface SavedNote {
  SavedNotesID: number;
  NoteID: number;
  UserID: number;
}
