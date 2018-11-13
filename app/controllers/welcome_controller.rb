class WelcomeController < ApplicationController
  before_action :authenticate_user!, only: [:login, :generate_token]
  after_action :prepare_intercom_shutdown, only: [:logout]
  after_action :intercom_shutdown, only: [:index]

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

  protected
  
  def prepare_intercom_shutdown
    IntercomRails::ShutdownHelper.prepare_intercom_shutdown(session)
  end

  def intercom_shutdown
    IntercomRails::ShutdownHelper.intercom_shutdown(session, cookies, request.domain)
  end
end
