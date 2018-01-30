class Api::DataTablesController < ApplicationApiController
  after_action :verify_authorized, except: [:parse]

  def index
    bot = Bot.find(params[:bot_id])
    authorize bot, :read_data_tables?
    data_tables = policy_scope(bot.data_tables)

    render json: data_tables.map { |dt| data_table_api_json(dt) }
  end

  def create
    bot = Bot.find(params[:bot_id])
    authorize bot, :create_data_table?
    data_table = bot.data_tables.build(data_table_params)
    data_table.save!
    render json: data_table_api_json(data_table), status: :created
  end

  def show
    data_table = DataTable.find(params[:id])
    authorize data_table

    respond_to do |format|
      format.json do
        render json: data_table_api_json(data_table, true)
      end
      format.csv do
        csv_data = CSV.generate do |csv|
          data_table.data.each do |row|
            csv << row
          end
        end
        send_data csv_data
      end
    end
  end

  def update
    data_table = DataTable.find(params[:id])
    authorize data_table
    data_table.update_attributes!(data_table_params)

    render json: data_table_api_json(data_table, true)
  end

  def destroy
    data_table = DataTable.find(params[:id])
    authorize data_table
    data_table.destroy
    head :ok
  end

  def parse
    if params[:file].present?
      data = ParseTableData.run(params[:file])
      render json: data
    else
      render json: { error: "missing parameter" }, status: 400
    end
  rescue => e
    render json: { error: e.message }, status: 422
  end

  private

  def data_table_api_json(data_table, with_data = false)
    {
      id: data_table.id,
      name: data_table.name,
      columns: data_table.columns,
      updated_at: data_table.updated_at,
      data: (data_table.data if with_data)
    }
  end

  def data_table_params
    table_params = params.require(:data_table)
                     .permit(policy(DataTable).permitted_attributes)
                     .merge({ data: params[:data_table][:data] })
    if params[:data_table][:data]
      # merge 'data' parameter manually since Rails chokes on nested array parameters
      # See https://github.com/rails/rails/issues/23640
      table_params[:data] = params[:data_table][:data]
    end
    if params[:json_data]
      # also, we use a separate text serialized json_data parameter because
      # Rails eliminates nil values at the end of nested arrays; thanks for
      # nothing Rails
      table_params[:data] = JSON.parse(params[:json_data])
    end
    table_params
  end

end
