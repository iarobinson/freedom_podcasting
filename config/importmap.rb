# Pin npm packages by running ./bin/importmap

pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
# pin "@hotwired/stimulus-loading", to: "https://ga.jspm.io/npm:@hotwired/stimulus-loading@1.1.1/dist/stimulus-loading.mjs"
pin_all_from "app/javascript/controllers", under: "controllers"