class InvoicesController < ApplicationController
  before_action :set_invoice, only: [:show, :edit, :update, :destroy]
  before_action :authenticate_user!
  before_action :set_user

  def index
    if current_user.role === "administrator"
      @producer_invoices = []
      @client_invoices = []
      Invoice.all.each do |i|
        if i.users.first.role == "producer"
          @producer_invoices << i
        elsif i.users.first.role == "client"
          @client_invoices << i
        end
      end
    else
      @invoices = []
      Invoice.all.each do |invoice|
        if invoice.users.include?(current_user)
          @invoices << invoice
        end
      end
      @invoices
    end

  end

  def show
    @amount_due_from_client = 0
    @invoice.episodes.each do |episode|
      @amount_due_from_client += episode.client_cost
    end
    @amount_due_from_client.round(2)
    @amount_due_to_producer = (@amount_due_from_client * 0.66).round(2)
    @producer = fetch_producer(@invoice.users)
  end

  def new
    @invoice = Invoice.new
  end

  def edit
  end

  def create
    @invoice = Invoice.new(invoice_params)

    respond_to do |format|
      if @invoice.save
        format.html { redirect_to @invoice, notice: 'Invoice was successfully created.' }
        format.json { render :show, status: :created, location: @invoice }
      else
        format.html { render :new }
        format.json { render json: @invoice.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @invoice.update(invoice_params)
        format.html { redirect_to @invoice, notice: 'Invoice was successfully updated.' }
        format.json { render :show, status: :ok, location: @invoice }
      else
        format.html { render :edit }
        format.json { render json: @invoice.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @invoice.destroy
    respond_to do |format|
      format.html { redirect_to invoices_url, notice: 'Invoice was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    def set_user
      @user = User.find(current_user[:id])
    end

    def set_invoice
      @invoice = Invoice.find(params[:id])
    end

    def invoice_params
      params.require(:invoice).permit(
        :amount_due_from_client, :status, :invoice_number, :invoice_date,
        :payment_due, :users_id, :notes
      )
    end

    def fetch_producer(users_array)
      users_array.to_a.each do |user|
        if user.role == "producer"
          return user
        end
      end
    end
end
