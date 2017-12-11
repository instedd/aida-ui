class Api::XlsFormController < ApplicationApiController
  def upload
    if params[:file].present?
      survey = ParseXlsForm.run(params[:file])
      render json: survey
    else
      render json: { error: "missing parameter" }, status: 400
    end
  rescue => e
    render json: { error: e.message }, status: 422
  end
end
