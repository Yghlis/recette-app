// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';

import './assets/style.css'; // Notre feuille de style globale

// Toast
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);

// Options pour les toasts
const toastOptions = {
  position: "top-right",
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false
};


app.use(router);
app.use(Toast, toastOptions);
app.mount('#app');
