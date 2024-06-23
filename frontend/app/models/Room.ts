// src/types/RoomCard.ts
export interface Room {
    id?: string;
    backgroundImage: string;
    name: string;
    songName?: string;
    artistName?: string;
    description: string;
    userProfile?: string;
    userID:string;
    username?: string;
    mine?:boolean;
    tags: string[];
    playlist?:string[];
    genre?: string,
    language?: string,
    roomSize?: Number,
    isExplicit?: boolean,
    isNsfw?: boolean,
  }
  