module ShowsHelper
  def if_it_exists_show_list_item(list_item)
    "<li class='list-group-item'>#{list_item}</li>".html_safe if list_item
  end
end
