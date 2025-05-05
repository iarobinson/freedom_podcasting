import { Controller } from "@hotwired/stimulus"
console.log("hello_controller.js loaded")
export default class extends Controller {
  static targets = ["output"]

  connect() {
    console.log("button clicked and message from hello_controller.js ran")
    this.outputTarget.textContent = "Greetings, Stimulus!"
  }

  toggle() {
    console.log("toggle button clicked")
    this.outputTarget.classList.toggle("hidden")
  }
}
