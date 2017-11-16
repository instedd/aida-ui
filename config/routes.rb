Rails.application.routes.draw do
  root to: 'welcome#index'
  get "/_design", to: 'welcome#design'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
