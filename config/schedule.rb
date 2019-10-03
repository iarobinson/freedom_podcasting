# Use this file to easily define all of your cron jobs.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Example:
#
# set :output, "/path/to/my/cron_log.log"
#
every 1.day do
  rake "utilities:sync_episodes_to_podcast_feeds"
end

every 1.month, :at => 'January 15th 1:00am' do
  rake "utilities:generate_new_round_of_monthly_invoices"
end
