class Api::BotsController < ApplicationApiController
  def index
    render json: current_user.bots.map { |b| bot_api_json(b) }
  end

  def create
    render json: bot_api_json(Bot.create_prepared!(current_user))
  end

  def update
    bot = current_user.bots.find(params[:id])
    bot_params = params.require(:bot).permit(:name)
    bot.update_attributes!(bot_params)
    render json: bot_api_json(bot)
  end

  def destroy
    bot = current_user.bots.find(params[:id])
    UnpublishBot.run(bot) if bot.published?
    bot.destroy
    head :no_content
  end

  def publish
    bot = current_user.bots.find(params[:id])
    if PublishBot.run(bot)
      render json: {result: :ok}
    else
      render json: {result: :error}, status: :bad_request
    end
  end

  def preview
    bot = current_user.bots.find(params[:id])
    if preview_uuid = PublishBot.preview(bot, params[:preview_uuid], params[:access_token])
      render json: {result: :ok, preview_uuid: preview_uuid}
    else
      render json: {result: :error}, status: :bad_request
    end
  end

  def data
    bot = current_user.bots.find(params[:id])
    cols = []
    data = []

    data = Backend.session_data(bot.uuid) if bot.published?
    cols = data[0]["data"].keys if data.length > 0

    csv_data = CSV.generate do |csv|
      csv << ["id", *cols]
      data.each do |r|
        row = [r["id"]]
        cols.each do |c|
          value = r["data"][c]
          if value.is_a?(Array)
            row << value.join(", ")
          else
            row << value
          end
        end

        csv << row
      end
    end

    send_data csv_data
  end

  def unpublish
    bot = current_user.bots.find(params[:id])
    if UnpublishBot.run(bot)
      head :no_content
    else
      render json: {result: :error}, status: :bad_request
    end
  end

  def stats
    bot = current_user.bots.find(params[:id])
    data = GatherBotStats.run(bot, params[:period])
    render json: data
  rescue RuntimeError => e
    render json: {error: e.message}, status: :bad_request
  end

  def manifest
    bot = current_user.bots.find(params[:id])
    send_data JSON.pretty_generate(bot.manifest), 
      type: "javascript/json; charset=UTF-8;",
      disposition: "attachment; filename= manifest-#{bot.id}-#{DateTime.now.utc}.json"
  end

  private

  def bot_api_json(bot)
    {
      id: bot.id,
      name: bot.name,
      published: bot.published?,
      channel_setup: bot.channels.first.setup?,
    }
  end
end
