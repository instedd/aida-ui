class WelcomeController < ApplicationController
  before_action :authenticate_user!, only: [:login, :generate_token]

  def index
    if user_signed_in?
      render :index
    elsif request.path == '/'
      render :landing, layout: false
    else
      redirect_to root_path
    end
  end

  def chat
    render :chat
  end

  def login
    redirect_to login_path
  end

  def logout
    sign_out :user
    respond_to do |format|
      format.all { head :no_content }
      format.html { redirect_to after_sign_out_path_for(:user) }
    end
  end

  def generate_token
    render json: { token: Guisso.generate_bearer_token(current_user.email) }
  end
end
