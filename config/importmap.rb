# Pin npm packages by running ./bin/importmap
pin "application", preload: true
pin_all_from "app/javascript/controllers", under: "controllers"
pin "bootstrap", to: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js"
pin "@popperjs/core", to: "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
pin "stimulus", to: "https://cdn.jsdelivr.net/npm/stimulus@3.2.2/+esm"
pin "@hotwired/turbo", to: "turbo.min.js", preload: true