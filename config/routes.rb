Rails.application.routes.draw do
  devise_for :users, controllers: {omniauth_callbacks: 'omniauth_callbacks'}
  guisso_for :user

  namespace :api, path: "/api/v1" do
    resources :bots, only: [:index, :create, :update]
  end

  get "/_design", to: 'welcome#design'
  get "/login", to: 'welcome#login'
  get "/logout", to: 'welcome#logout'

  root to: 'welcome#index'
  get "/b(/*path)", to: 'welcome#index'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
