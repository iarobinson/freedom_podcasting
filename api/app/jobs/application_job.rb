class ApplicationJob < ActiveJob::Base
  retry_on ActiveRecord::Deadlocked, attempts: 3, wait: 5.seconds
  discard_on ActiveJob::DeserializationError
end
