// App.tsx
import React from 'react';
import ApiTest from './api-test';
import { ApiProvider } from '../api/APIContext';
import { DefaultApi } from '../api-client';

const api = new DefaultApi();

const App: React.FC = () => {
  return (
    <ApiProvider api={api}>
      <ApiTest />
    </ApiProvider>
  );
};

export default App;
