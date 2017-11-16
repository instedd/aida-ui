Rails.application.routes.draw do
  namespace :api, path: "/api/v1" do
    resources :bots, only: [:index, :create]
  end

  root to: 'welcome#index'
  get "/_design", to: 'welcome#design'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
