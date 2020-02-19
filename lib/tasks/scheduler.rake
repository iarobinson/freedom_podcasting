# desc "Create a new round of invoices on the 15th of the month"
# task :create_new_round_of_invoices_on_the_15th_of_each_month => :environment do
#   if Time.now.day == 15
#     @producers = User.all.where(role: "producer")
#     @producers.each do |producer|
#
#       @new_invoice = Invoice.new
#       @new_invoice.users << producer
#       @new_invoice.save
#
#       producer.shows.each do |producer_show|
#         producer_show.episodes.each do |producer_show_episode|
#           the_15th_of_last_month = Date.new(Time.now.year, Time.now.month, 15).prev_month
#           if producer_show_episode.pub_date > the_15th_of_last_month
#             @new_invoice.episodes << producer_show_episode
#           end
#         end
#       end
#     end
#   end
# end
