class Page < ApplicationRecord
  def show
    @page = Page.first
  end
end
