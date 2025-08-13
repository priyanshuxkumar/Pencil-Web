import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { CanvasProvider } from './context/CanvasProvider.tsx';
import { ToolsProvider } from './context/ToolProvider.tsx';
import { SocketProvider } from './context/SocketProvider.tsx';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <SocketProvider>
            <CanvasProvider>
                <ToolsProvider>
                    <App />
                </ToolsProvider>
            </CanvasProvider>
        </SocketProvider>
    </BrowserRouter>,
);
