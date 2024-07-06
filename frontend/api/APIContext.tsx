// src/api/ApiContext.tsx
import React, { createContext, useContext } from 'react';
import { Configuration, DefaultApi, ProfileApi, RoomsApi, UsersApi } from './../api-client';

const ApiContext = createContext<DefaultApi | null>(null);

//for other paths of the API
const ProfileContext = createContext<ProfileApi | null>(null);
const RoomsContext = createContext<RoomsApi | null>(null);
const UsersContext = createContext<UsersApi | null>(null);


export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = new Configuration({ basePath: 'http://192.168.118.63:3000' });
  const apiService = new DefaultApi(config);

  return (
    <ApiContext.Provider value={apiService}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === null) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};