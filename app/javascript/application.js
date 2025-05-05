// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import { Application } from "@hotwired/stimulus"
// import { definitionsFromContext } from "@hotwired/stimulus-loading"

const application = Application.start()
// const context = require.context("controllers", true, /\.js$/)
// application.load(definitionsFromContext(context))

import "@hotwired/turbo-rails"