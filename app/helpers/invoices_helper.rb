module InvoicesHelper
  def format_clean_invoice_range(date)
    last_month = Date::MONTHNAMES[date.month]
    current_month = Date::MONTHNAMES[(date.month + 1) % 12]
    last_month + " - " + current_month + " " + date.year.to_s
  end
end
