class Itunes::ShowLookupService < ApplicationService
  include HTTParty
  base_uri 'api.stackexchange.com'

  def initialize(url)
    @url = url
  end

  def perform

  end
end
