import { Application } from "@hotwired/stimulus"
// import { definitionsFromContext } from "@hotwired/stimulus-loading"

const application = Application.start()
const context = require.context(".", true, /\.js$/)
application.load(definitionsFromContext(context))