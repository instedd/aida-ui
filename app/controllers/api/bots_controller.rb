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
    UnpublishBot.run(@bot) if @bot.published?
    @bot.destroy
    head :no_content
  end

  def publish
    authorize @bot
    if PublishBot.run(@bot)
      render json: {result: :ok}
    else
      render json: {result: :error}, status: :bad_request
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
    if preview_uuid = PublishBot.preview(@bot, params[:preview_uuid], params[:access_token])
      render json: {result: :ok, preview_uuid: preview_uuid}
    else
      render json: {result: :error}, status: :bad_request
    end
  end

  def data
    authorize @bot, :read_session_data?

    data = []
    data = Backend.session_data(@bot.uuid) if @bot.published?

    respond_to do |format|
      format.csv do
        cols = []
        cols = data.flat_map { |elem| elem["data"].keys }.uniq

        csv_data = CSV.generate do |csv|
          csv << ["id", *cols]
          data.each do |r|
            row = [r["id"]]
            cols.each do |c|
              value = r["data"][c]
              if value.is_a?(Array)
                row << value.join(", ")
              elsif value.is_a?(Hash)
                row << value.to_json
              else
                row << value
              end
            end

            csv << row
          end
        end

        send_data csv_data
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
      channel_setup: bot.channels.first.setup?,
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
end
