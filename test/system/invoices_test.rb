require "application_system_test_case"

class InvoicesTest < ApplicationSystemTestCase
  setup do
    @invoice = invoices(:one)
  end

  test "visiting the index" do
    visit invoices_url
    assert_selector "h1", text: "Invoices"
  end

  test "creating a Invoice" do
    visit invoices_url
    click_on "New Invoice"

    fill_in "Amount due", with: @invoice.amount_due_from_client
    fill_in "Invoice date", with: @invoice.invoice_date
    fill_in "Invoice number", with: @invoice.invoice_number
    fill_in "Notes", with: @invoice.notes
    fill_in "Payment due", with: @invoice.payment_due
    fill_in "Status", with: @invoice.status
    fill_in "Users", with: @invoice.users_id
    click_on "Create Invoice"

    assert_text "Invoice was successfully created"
    click_on "Back"
  end

  test "updating a Invoice" do
    visit invoices_url
    click_on "Edit", match: :first

    fill_in "Amount due", with: @invoice.amount_due_from_client
    fill_in "Invoice date", with: @invoice.invoice_date
    fill_in "Invoice number", with: @invoice.invoice_number
    fill_in "Notes", with: @invoice.notes
    fill_in "Payment due", with: @invoice.payment_due
    fill_in "Status", with: @invoice.status
    fill_in "Users", with: @invoice.users_id
    click_on "Update Invoice"

    assert_text "Invoice was successfully updated"
    click_on "Back"
  end

  test "destroying a Invoice" do
    visit invoices_url
    page.accept_confirm do
      click_on "Destroy", match: :first
    end

    assert_text "Invoice was successfully destroyed"
  end
end
