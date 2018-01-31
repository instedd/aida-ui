class Api::EncryptionKeysController < ApplicationApiController

  def fetch
    render json: {
      public_key: current_user.public_key,
      encrypted_secret_key: current_user.encrypted_secret_key
    }
  end

  def update
    current_user.update_attributes!({
      public_key: params[:public_key],
      encrypted_secret_key: params[:encrypted_secret_key]
    })

    render json: {
      public_key: current_user.public_key,
      encrypted_secret_key: current_user.encrypted_secret_key
    }
  end
end
