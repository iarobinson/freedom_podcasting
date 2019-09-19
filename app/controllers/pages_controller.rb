class PagesController < ApplicationController

  def home
    if current_user.nil?
      #something...
    elsif current_user.administrator?
      @users = User.all
    end
  end
end
