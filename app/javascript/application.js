// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import { Application } from "@hotwired/stimulus"
import "bootstrap"
import { Turbo } from "@hotwired/turbo-rails"

const application = Application.start()
window.Stimulus   = application
application.debug = false
Turbo.start()
export { application }



