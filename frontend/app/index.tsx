import React from 'react';
import { ApiProvider } from './../api/APIContext';
import ApiTest from './api-test';

export default function App() {
  return (
    <ApiProvider>
      <ApiTest />
    </ApiProvider>
  );
}