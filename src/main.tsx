import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { IS_JEBI_SITE } from './lib/siteMode';

// The standalone JEBI site gets its own tab title, icon and description.
if (IS_JEBI_SITE) {
  document.title = 'Jay Edwards Baseball Invitational | Feb 5–7, 2027 · Atlanta';
  document.querySelector('link[rel="icon"]')?.setAttribute('href', '/images/jebi/jebi-logo.png');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#560D22');
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute(
      'content',
      'The Inaugural Jay Edwards Baseball Invitational — six collegiate programs, nine games, February 5–7, 2027 at Gresham Park in Atlanta. Presented by the Maroon Tiger Homerun Club.',
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
