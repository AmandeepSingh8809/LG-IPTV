import { createRoot } from 'react-dom/client';

import ThemeDecorator from '@enact/sandstone/ThemeDecorator';
import './styles/custom-glass.less';
import '@enact/sandstone/styles/colors.less';
import '@enact/sandstone/styles/skin.less';

import App from './App/App';


const MyApp = ThemeDecorator(App);


const container = document.getElementById('root');

const root = createRoot(container);

root.render(
    <MyApp />
);