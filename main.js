import { createApp } from 'vue'
import { datadogRum } from '@datadog/browser-rum'
import App from './App.vue'
import './estilo.css'

datadogRum.init({
  applicationId: '11de7aff-83ae-45fc-9329-12a0fd007d17',
  clientToken: 'pub63b4407a4fcc384f8d6b69dc879c8096',
  site: 'us3.datadoghq.com',
  service: 'estudos-petrobras',
  env: 'production',
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackResources: true,
  trackUserInteractions: true,
  trackLongTasks: true,
});

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('[Global ErrorHandler]', err, info);
};

app.mount('#app')
