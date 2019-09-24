class ApplicationJob < ActiveJob::Base

  def pull_episodes_from_the_wilds
    p "<<<<<<<<<<<< pull_episodes_from_the_wilds CALLED! :D >>>>>>>>>>>>>>>>"
  end
end
