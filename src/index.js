import React from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { AmplifyProvider, Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import awsconfig from './aws-exports';
import App from './App';
import './styles/App.css';

// Configure Amplify before rendering
Amplify.configure(awsconfig);

// Custom theme for Amplify components
const theme = {
  name: 'TaskManagerTheme',
  tokens: {
    colors: {
      brand: {
        primary: { value: '#4361ee' },
        secondary: { value: '#3a0ca3' }
      }
    },
    components: {
      button: {
        primary: {
          backgroundColor: { value: '{colors.brand.primary.value}' },
          _hover: {
            backgroundColor: { value: '{colors.brand.secondary.value}' }
          }
        },
        link: {
          color: { value: '{colors.brand.primary.value}' },
          _hover: {
            color: { value: '{colors.brand.secondary.value}' }
          }
        }
      },
      tabs: {
        item: {
          _active: {
            color: { value: '{colors.brand.primary.value}' }
          },
          _hover: {
            color: { value: '{colors.brand.primary.value}' }
          }
        }
      },
      textfield: {
        _focus: {
          borderColor: { value: '{colors.brand.primary.value}' },
          boxShadow: { value: '0 0 0 2px rgba(67, 97, 238, 0.3)' }
        }
      }
    }
  }
};

// Get the root element from public/index.html
const container = document.getElementById('root');
const root = createRoot(container);

// Render the app inside Amplify UI Provider with custom theme
root.render(
  <React.StrictMode>
    <AmplifyProvider theme={theme}>
      <Authenticator.Provider>
        <App />
      </Authenticator.Provider>
    </AmplifyProvider>
  </React.StrictMode>
);