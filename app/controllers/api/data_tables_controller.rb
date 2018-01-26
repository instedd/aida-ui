class Api::DataTablesController < ApplicationApiController
  after_action :verify_authorized, except: [:parse]

  def index
    bot = Bot.find(params[:bot_id])
    authorize bot, :read_data_tables?
    data_tables = policy_scope(bot.data_tables)

    render json: data_tables.map { |dt| data_table_api_json(dt) }
  end

  def create
    # TODO
  end

  def show
    data_table = DataTable.find(params[:id])
    authorize data_table

    render json: data_table_api_json(data_table, true)
  end

  def update
    # TODO
  end

  def destroy
    # TODO
  end

  def parse
    # TODO
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
end
