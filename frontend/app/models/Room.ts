// src/types/RoomCard.ts
export interface Room {
    id?: string;
    backgroundImage: string;
    name: string;
    songName?: string;
    artistName?: string;
    description: string;
    userProfile?: string;
    username?: string;
    mine?:boolean;
    tags: string[];
    playlist?:string[];
  }
  