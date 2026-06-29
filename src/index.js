import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/base.css';
import './assets/css/customerlogo.css';
import './assets/css/userprofile.css';
import './assets/css/sidebar.css';
import './assets/css/supplierquotation.css';
import './assets/css/header.css';
import './assets/css/marque.css';
import './assets/css/approvalflow.css';
import './assets/css/datagrid.css';
import './assets/css/role.css';
import './assets/css/communication.css';
import './assets/css/querylist.css';
import './assets/css/detailsreport.css';
import './assets/css/configuremodule.css';
import './assets/css/design-system.css';
import './assets/css/rfq-modern.css';
import './assets/css/master-form-panel.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from "react-redux";
import { store } from "./redux/index";
import { CookiesProvider } from 'react-cookie';
import reducer, { initialState } from "./store/reducer";
import { StateProvider } from "./store/StateProvider";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StateProvider initialState={initialState} reducer={reducer}>
    <Provider store={store}>
      <CookiesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CookiesProvider>
    </Provider>
  </StateProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
