module ApplicationHelper
  def the_15th_of_last_month
    Date.new(Time.now.year, Time.now.month, 15).prev_month
  end
  def common_big_bold_button
    "w-100 btn btn-lg btn-primary my-2"
  end
end
