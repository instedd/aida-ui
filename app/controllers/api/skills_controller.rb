class Api::SkillsController < ApplicationApiController
  after_action :verify_authorized

  def index
    bot = Bot.find(params[:bot_id])
    authorize bot, :read_behaviours?
    skills = bot.skills

    render json: skills.map { |s| skill_api_json(s) }
  end

  def create
    bot = Bot.find(params[:bot_id])
    authorize bot, :create_skill?

    new_order = [bot.behaviours.count, bot.behaviours.pluck(:order).compact.max + 1].max
    attrs = { order: new_order }
    if params[:name].present?
      attrs[:name] = params[:name]
    end
    new_skill = bot.behaviours.create_skill!(params[:kind], attrs)

    render json: skill_api_json(new_skill), status: :created
  rescue RuntimeError => e
    # Handle invalid skill kind failure
    render json: {error: e.message}, status: :bad_request
  end

  def update
    skill = Behaviour.skills.find(params[:id])
    authorize skill
    skill_params = params.require(:skill).permit(policy(skill).permitted_attributes)
    skill.update_attributes!(skill_params)
    render json: skill_api_json(skill)
  end

  def destroy
    skill = Behaviour.skills.find(params[:id])
    authorize skill
    skill.destroy
    head :ok
  end

  private

  def skill_api_json(skill)
    {
      id: skill.id,
      name: skill.name,
      kind: skill.kind,
      config: skill.config,
      order: skill.order,
      enabled: skill.enabled
    }
  end
end
