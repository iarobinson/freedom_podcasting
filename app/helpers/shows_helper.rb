module ShowsHelper
  def if_it_exists_show_list_item(list_items)
    strings_of_list_group_items = ""
    list_items.each do |item|
      strings_of_list_group_items += "<li class='list-group-item'>#{item}</li>" if item
    end
    strings_of_list_group_items.html_safe
  end
end
