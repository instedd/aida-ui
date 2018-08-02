class Api::SkillsController < ApplicationApiController
  after_action :verify_authorized

  def index
    bot = Bot.find(params[:bot_id])
    authorize bot, :read_behaviours?
    skills = policy_scope(bot.skills)

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
    skill_params["config"]["hours"] = params["skill"]["config"]["hours"]
    skill.update_attributes!(skill_params)
    render json: skill_api_json(skill)
  end

  def destroy
    skill = Behaviour.skills.find(params[:id])
    authorize skill
    skill.destroy
    head :ok
  end

  def reorder
    bot = Bot.find(params[:bot_id])
    authorize bot, :reorder_skills?
    if params[:order].keys.include? bot.front_desk.id.to_s
      head :bad_request
    else
      # Behaviours are indexed by id to avoid doing an additional query to fetch each behaviour
      behaviours = bot.behaviours.all.index_by(&:id)
      params[:order].each do |key, value|
        b = behaviours[Integer(key)]
        b.order = value
        b.save!
      end
      head :no_content
    end
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
