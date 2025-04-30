// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "bootstrap"

import { Turbo } from "@hotwired/turbo";
Turbo.start()

import { Application } from "stimulus"

// Initialize Stimulus
export const application = Application.start()
