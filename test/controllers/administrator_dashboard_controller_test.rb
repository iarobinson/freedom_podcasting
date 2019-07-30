require 'test_helper'

class AdministratorDashboardControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get administrator_dashboard_index_url
    assert_response :success
  end

end
