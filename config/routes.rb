Rails.application.routes.draw do

  devise_for :producers, controllers: { sessions: "producers/sessions" }
  devise_for :clients, controllers: { sessions: "clients/sessions" }
  resources :pages, :producers, :clients, :home

  resources :dashboard

  root 'pages#home'

  resources :producers, module: "producers" do
    resources :dashboard, only: %i[index]
  end
end
