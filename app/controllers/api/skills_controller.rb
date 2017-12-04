class Api::SkillsController < ApplicationApiController
  def index
    skills = current_user.bots.find(params[:bot_id]).skills

    render json: skills.map { |s| skill_api_json(s) }
  end

  def create
    bot = current_user.bots.find(params[:bot_id])
    new_order = bot.behaviours.last.order + 1
    attrs = { order: new_order }
    if params[:skill_name].present?
      attrs[:name] = params[:skill_name]
    end
    new_skill = bot.behaviours.create_skill!(params[:skill_kind], attrs)

    render json: skill_api_json(new_skill), status: :created
  rescue RuntimeError => e
    # Handle invalid skill kind failure
    render json: {error: e.message}, status: :bad_request
  end

  def update
    skill = Behaviour.skills.of_bots_owned_by(current_user).find(params[:id])
    skill_params = params.require(:skill).permit(:name, :enabled, config: {})
    skill.update_attributes!(skill_params)
    render json: skill_api_json(skill)
  end

  def destroy
    skill = Behaviour.skills.of_bots_owned_by(current_user).find(params[:id])
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
