import { mount } from 'svelte';
import '@fontsource/dm-serif-display/latin-400.css';
import '@fontsource/fira-sans/latin-400.css';
import '@fontsource/fira-sans/latin-600.css';
import './app.css';
import App from './App.svelte';

export default mount(App, { target: document.getElementById('app')! });
