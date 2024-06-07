// src/types/RoomCard.ts
export interface Room {
    backgroundImage: string;
    name: string;
    songName: string;
    artistName: string;
    description: string;
    userProfile?: string;
    username?: string;
    mine?:boolean;
    tags: string[];
  }
  