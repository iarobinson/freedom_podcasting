class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAILER_FROM", "noreply@freedompodcasting.com")
  layout "mailer"
end
