module ShowsHelper
  require 'open-uri'

  def if_it_exists_show_list_item(list_items, pretext="", posttext="")
    strings_of_list_group_items = ""
    list_items.each do |item|
      strings_of_list_group_items += "<li class='list-group-item'>#{pretext}#{item}#{posttext}</li>" if item
    end
    strings_of_list_group_items.html_safe
  end

  def select_podcast_category_menu_item
    options = "<option selected>Choose...</option>"

    @show.categories.each do |category|
      options += "<option value='" + category + "'>" + category + "</option>"
    end
    options.html_safe
  end
end
