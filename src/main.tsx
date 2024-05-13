import './styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { SettingsProvider } from './context/SettingsContext';
import { ArchiveProvider } from './context/ArchiveContext';
import { SelectedProvider } from './context/SelectedContext';
import { ToastProvider } from '@ui/toast';

// document.addEventListener('contextmenu', event => {
//   event.preventDefault();
// })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <SettingsProvider>
            <ArchiveProvider>
                <SelectedProvider>
                    <ToastProvider>
                        <App />
                    </ToastProvider>
                </SelectedProvider>
            </ArchiveProvider>
        </SettingsProvider>
    </React.StrictMode>
);
