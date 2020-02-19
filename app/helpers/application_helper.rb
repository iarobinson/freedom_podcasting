module ApplicationHelper
  def the_15th_of_last_month
    Date.new(Time.now.year, Time.now.month, 15).prev_month
  end
end
