import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import LoadingSpinner from './components/LoadingSpinner';



ReactDOM.render(
  <>
    <App />
    <LoadingSpinner />
  </>, document.getElementById('root')
);
serviceWorker.unregister();

