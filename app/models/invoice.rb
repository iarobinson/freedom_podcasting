class Invoice < ApplicationRecord
  has_and_belongs_to_many :users
  has_and_belongs_to_many :episodes

  def calculate_total
    total_due = 0
    self.episodes.each do |e|
      total_due += e.client_cost
    end
    self.amount_due_from_client = total_due
    self.amount_due_to_producer = total_due * 0.66
    total_due = 0
    return self.save
  end
end
