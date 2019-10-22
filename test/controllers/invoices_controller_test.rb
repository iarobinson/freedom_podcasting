require 'test_helper'

class InvoicesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @invoice = invoices(:one)
  end

  test "should get index" do
    get invoices_url
    assert_response :success
  end

  test "should get new" do
    get new_invoice_url
    assert_response :success
  end

  test "should create invoice" do
    assert_difference('Invoice.count') do
      post invoices_url, params: { invoice: { amount_due_from_client: @invoice.amount_due_from_client, invoice_date: @invoice.invoice_date, invoice_number: @invoice.invoice_number, notes: @invoice.notes, payment_due: @invoice.payment_due, status: @invoice.status, users_id: @invoice.users_id } }
    end

    assert_redirected_to invoice_url(Invoice.last)
  end

  test "should show invoice" do
    get invoice_url(@invoice)
    assert_response :success
  end

  test "should get edit" do
    get edit_invoice_url(@invoice)
    assert page.body.includes?("No invoices are currently associated with your account.")
  end

  test "should update invoice" do
    patch invoice_url(@invoice), params: { invoice: { amount_due_from_client: @invoice.amount_due_from_client, invoice_date: @invoice.invoice_date, invoice_number: @invoice.invoice_number, notes: @invoice.notes, payment_due: @invoice.payment_due, status: @invoice.status, users_id: @invoice.users_id } }
    assert_redirected_to invoice_url(@invoice)
  end

  test "should destroy invoice" do
    assert_difference('Invoice.count', -1) do
      delete invoice_url(@invoice)
    end

    assert_redirected_to invoices_url
  end
end
