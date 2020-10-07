require 'rails_helper'

RSpec.describe "UserSignInFlows", type: :request do
  describe "GET /user_sign_in_flows" do
    it "works! (now write some real specs)" do
      get root_path
      expect(response).to have_http_status(200)
    end

    it "allows new users to creat accounts and start a podcast" do
      # get new_user_registration_path
      # expect(response).to have("Sign up")
    end
  end

  # describe Factorial do
  #
  # end
end
