class Api::BotsController < ApplicationApiController
  before_action :load_bot, except: [:index, :create]
  after_action :verify_authorized

  def index
    authorize Bot
    bots = policy_scope(Bot).includes(:channels, :collaborators)
    render json: bots.map { |b| bot_api_json(b) }
  end

  def create
    authorize Bot
    render json: bot_api_json(Bot.create_prepared!(current_user))
  end

  def update
    authorize @bot
    @bot.update_attributes!(permitted_attributes(@bot))
    render json: bot_api_json(@bot)
  end

  def destroy
    authorize @bot
    UnpublishBot.run(@bot)
    UnpublishBotPreview.run(@bot)

    @bot.destroy
    head :no_content
  end

  def publish
    authorize @bot
    result = PublishBot.run(@bot)
    if result[:status] == :ok
      render json: {result: :ok}
    else
      render json: {result: result[:errors]}, status: :bad_request
    end
  end

  def unpublish
    authorize @bot
    if UnpublishBot.run(@bot)
      head :no_content
    else
      render json: {result: :error}, status: :bad_request
    end
  end

  def duplicate
    authorize @bot
    duplicate = DuplicateBot.run(@bot, current_user)
    render json: bot_api_json(duplicate)
  end

  def preview
    authorize @bot
    preview_uuid = PublishBot.preview(@bot, params[:access_token])
    if preview_uuid.is_a?(String)
      session = current_user.sessions.where(bot: @bot).take
      session_uuid = session.session_uuid if session
      render json: {result: :ok, preview_uuid: preview_uuid, session_uuid: session_uuid}
    else
      render json: {result: preview_uuid[:errors]}, status: :bad_request
    end
  end

  def set_session
    authorize @bot
    session = @bot.get_session current_user
    if session
      session.session_uuid = params[:session_uuid]
      session.save!
    else
      session = Session.create user: current_user, bot: @bot, session_uuid: params[:session_uuid]
    end
    if session && session.session_uuid
      render json: {result: :ok, session_uuid: session.session_uuid}
    else
      render json: {result: :error}, status: :bad_request
    end
  end

  def data
    authorize @bot, :read_session_data?

    data = []
    data = Backend.session_data(@bot.uuid, params[:period]) if @bot.published?

    data.each do |row|
      row_data = row["data"]
      row_data.each do |key, value|
        if value.is_a?(Hash) && value["type"] == "image"
          @public_content_url ||= URI.parse("#{Settings.backend.public_content_url}/")
          value["url"] = @public_content_url.merge("./image/#{value["id"]}").to_s
        end
      end
    end

    respond_to do |format|
      format.csv do
        send_data build_data_csv(data, params[:period])
      end

      format.json do
        render json: data
      end
    end
  end

  def stats
    authorize @bot, :read_usage_stats?
    data = GatherBotStats.run(@bot, params[:period])
    render json: data
  rescue RuntimeError => e
    render json: {error: e.message}, status: :bad_request
  end

  def error_logs
    authorize @bot, :read_error_logs?
    data = []
    data = GatherBotErrorLogs.run(@bot, params[:period]) if @bot.published?
    render json: data
  rescue RuntimeError => e
    render json: {error: e.message}, status: :bad_request
  end

  def manifest
    authorize @bot, :download_manifest?
    send_data JSON.pretty_generate(@bot.manifest),
      type: "javascript/json; charset=UTF-8;",
      disposition: "attachment; filename= manifest-#{@bot.id}-#{DateTime.now.utc.to_s(:iso8601)}.json"
  end

  private

  def load_bot
    @bot = Bot.find(params[:id])
  end

  def bot_api_json(bot)
    {
      id: bot.id,
      name: bot.name,
      published: bot.published?,
      channel_setup: bot.channels.any?{|c| c.setup? },
      uuid: bot.uuid,
      channels: bot.channels.select{|c| c.setup? }.map{|c| c.name.capitalize },
      permissions: bot_permissions(bot),
      collaborator_id: bot.collaborators.find { |c| c.user_id == current_user.id }.try(:id)
    }
  end

  def bot_permissions(bot)
    bot_policy = policy(bot)
    {
      can_admin: bot_policy.can_admin?,
      can_publish: bot_policy.can_publish?,
      manages_behaviour: bot_policy.manages_behaviour?,
      manages_content: bot_policy.manages_content?,
      manages_variables: bot_policy.manages_variables?,
      manages_results: bot_policy.manages_results?
    }
  end

  def extract_asset_columns(sessions)
    sessions.map do |session|
      grouped_assets = session["assets"].group_by {|asset| asset["skill_id"]}

      grouped_assets.keys.inject([]) do |result, skill_id|
        grouped_assets[skill_id].each_with_index do |asset, i|
          result << asset["data"].keys.map do | key |
            {
              column_name: key + "_" + i.to_s,
              skill_id: skill_id,
              index: i,
              key: key
            }
          end
        end

        result
      end
    end.flatten.uniq
  end

  def build_data_csv(sessions, period)
    cols = []
    cols = sessions.flat_map { |elem| elem["data"].keys }.uniq

    csv_data = unless period == "none"
      asset_cols = extract_asset_columns(sessions)

      CSV.generate do |csv|
        csv << ["id", *cols, *asset_cols.map {|col| col[:column_name]}]
        sessions.each do |r|
          row = [r["id"]]
          cols.each do |c|
            value = r["data"][c]
            row << extract(value)
          end

          asset_cols.each do |c|
            value = r["assets"].select do |asset|

              asset["skill_id"] == c[:skill_id]
            end
            row << if value != [] && asset = value[c[:index]]
              extract(asset["data"][c[:key]])
            else
              ""
            end
          end

          csv << row
        end
      end
    else
      CSV.generate do |csv|
        csv << ["id", *cols]
        sessions.each do |r|
          row = [r["id"]]
          cols.each do |c|
            value = r["data"][c]
            row << extract(value)
          end

          csv << row
        end
      end
    end


    csv_data
  end

  def extract(value)
    if value.is_a?(Array)
      value.join(", ")
    elsif value.is_a?(Hash) && value["type"] == "image"
      value["url"]
    elsif value.is_a?(Hash) && value["type"] == "encrypted"
      "** encrypted **"
    elsif value.is_a?(Hash)
      value.to_json
    else
      value
    end
  end
end
