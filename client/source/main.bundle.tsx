import '@client/debug';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppComponent } from '@client/components/pages/AppComponent';
import { BrowserRouter } from 'react-router-dom';

const USE_STRICT_MODE = false;

const container = document.getElementById('consolecowboy-app');
const root = createRoot(container!);

root.render(<>
  {USE_STRICT_MODE ?
    <React.StrictMode>
      <BrowserRouter>
        <AppComponent/>
      </BrowserRouter>
    </React.StrictMode>
  :
    <BrowserRouter>
      <AppComponent/>
    </BrowserRouter>
  }
</>);