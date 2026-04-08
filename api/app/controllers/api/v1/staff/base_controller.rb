module Api::V1::Staff
  class BaseController < ApplicationController
    before_action :require_staff!
  end
end
