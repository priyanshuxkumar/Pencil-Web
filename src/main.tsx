import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { CanvasProvider } from './context/CanvasProvider.tsx';
import { ToolsProvider } from './context/ToolProvider.tsx';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <CanvasProvider>
            <ToolsProvider>
                <App />
            </ToolsProvider>
        </CanvasProvider>
    </BrowserRouter>,
);
