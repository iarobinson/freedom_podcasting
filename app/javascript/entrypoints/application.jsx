// // Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
// import { Application } from "@hotwired/stimulus"
// // import { definitionsFromContext } from "@hotwired/stimulus-loading"

// const application = Application.start()
// // const context = require.context("controllers", true, /\.js$/)
// // application.load(definitionsFromContext(context))

// import "@hotwired/turbo-rails"

import React from "react";
import ReactDOM from "react-dom/client";
import App from "../../frontend/App";
import axios from "axios";
import { getCSRFToken } from "../../frontend/csrf";

// Add CSRF token from Rails <meta> tag to all Axios requests
const token = document.querySelector('meta[name="csrf-token"]')?.content;

if (token) {
  // axios.defaults.headers.common["X-CSRF-Token"] = token;
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common["X-CSRF-Token"] = getCSRFToken();
}

console.log("application.jsx loaded");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
