import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["output"]

  connect() {
    console.log("button clicked and message from hello_controller.js ran")
    this.outputTarget.textContent = "Hello, Stimulus!"
  }

  toggle() {
    this.outputTarget.classList.toggle("hidden")
  }
}
