class Api::TranslationsController < ApplicationApiController
  after_action :verify_authorized

  def index
    bot = Bot.find(params[:bot_id])
    authorize bot, :read_translations?

    languages = bot.available_languages
    translations = bot.translations.where(lang: languages)
    keys = bot.translation_keys
    variable_assignments = bot.variable_assignments

    render json: translations_api_json(keys, variable_assignments, bot.default_language, bot.other_languages, translations)
  end

  def update
    bot = Bot.find(params[:bot_id])
    authorize bot, :update_translation?

    behaviour = bot.behaviours.find(params[:behaviour_id])
    valid_keys = behaviour.translation_keys.map do |key|
      key[:key]
    end
    if valid_keys.include?(params[:key])
      valid_languages = bot.available_languages
      if params[:lang] == bot.default_language
        render json: {error: "Invalid language (default language, use skill endpoint)"},
               status: :bad_request
      elsif valid_languages.include?(params[:lang])
        translation = behaviour.translations.find_or_create_by!(key: params[:key],
                                                                lang: params[:lang])
        translation.update_attributes! value: params[:value]
        head :no_content
      else
        render json: {error: "Invalid language #{params['lang']}"},
               status: :bad_request
      end
    else
      render json: {error: "Invalid translation key #{params['key']}"},
             status: :bad_request
    end
  end

  def update_variable
    bot = current_user.bots.find(params[:bot_id])

    assignment_params = params.permit(:variable_id, :variable_name, :condition_id, :condition, :lang, :value, :condition_order)

    unless bot.available_languages.include?(assignment_params[:lang])
      render json: {error: "Invalid language #{assignment_params[:lang]}"},
             status: :bad_request
      return
    end

    if (assignment_params[:condition].nil? && assignment_params[:condition_id].nil? && assignment_params[:condition_order].nil?) !=
      (assignment_params[:condition].nil? || assignment_params[:condition_id].nil? || assignment_params[:condition_order].nil?)
      render json: {error: "condition_id, condition and condition_order params needs to be used together"},
             status: :bad_request
      return
    end

    # default language is kept as `nil` to play nice when default language is changed
    assignment_params[:lang] = nil if bot.default_language == assignment_params[:lang]
    assignment_params[:condition_order] = 0 if assignment_params[:condition_id].blank?

    variable_filter = { variable_id: assignment_params[:variable_id] }
    condition_filter = variable_filter.merge(condition_id: assignment_params[:condition_id])

    ActiveRecord::Base.transaction do
      # update denormalized variable values
      bot.variable_assignments.where(variable_filter).update_all(variable_name: assignment_params[:variable_name])

      # update denormalized condition values
      if assignment_params[:condition_id].present?
        bot.variable_assignments.where(condition_filter).update_all(condition: assignment_params[:condition], condition_order: assignment_params[:condition_order])
      end

      # ensure a variable_assignments exists for the default value and default lang
      bot.variable_assignments.find_or_create_by(variable_filter.merge(lang: nil, condition_id: nil)) do |a|
        a.variable_name = assignment_params[:variable_name]
        a.condition_order = 0
        a.condition = nil
        a.value = ""
      end

      # ensure a variable_assignments exists for the condition and default lang
      bot.variable_assignments.find_or_create_by(variable_filter.merge(lang: nil, condition_id: assignment_params[:condition_id])) do |a|
        a.variable_name = assignment_params[:variable_name]
        a.condition_order = assignment_params[:condition_order]
        a.condition = assignment_params[:condition]
        a.value = ""
      end

      # create the record to store the condition/lang assignment
      variable_assignment = bot.variable_assignments.find_or_initialize_by(condition_filter.merge(lang: assignment_params[:lang]))

      variable_assignment.variable_name = assignment_params[:variable_name]
      variable_assignment.condition = assignment_params[:condition]
      variable_assignment.condition_order = assignment_params[:condition_order]

      variable_assignment.value = assignment_params[:value]
      variable_assignment.save!

      head :no_content
    end
  end

  def destroy_variable
    bot = current_user.bots.find(params[:bot_id])

    assignment_params = params.permit(:variable_id, :condition_id)

    if params[:variable_id].nil?
      render json: {error: "variable_id is required"},
             status: :bad_request
      return
    end

    bot.variable_assignments.where(assignment_params).destroy_all

    head :no_content
  end

  private

  def translations_api_json(translation_keys, variable_assignments, default_language, other_languages, translations)
    translations_by_behaviour = translations.group_by(&:behaviour_id)

    {
      default_language: default_language,
      languages: [default_language] + other_languages,
      behaviours: translation_keys.map do |behaviour_keys|
        behaviour_translations = translations_by_behaviour[behaviour_keys[:id]] || []
        {
          id: behaviour_keys[:id],
          label: behaviour_keys[:label],
          keys: behaviour_keys[:keys].map do |keys|
            result = {
              _key: keys[:key],
              _label: keys[:label],
              default_language => keys[:default_translation]
            }
            other_languages.inject(result) do |memo, lang|
              translation = behaviour_translations.find do |t|
                t.lang == lang && t.key == keys[:key]
              end
              memo[lang] = translation.value rescue ''
              memo
            end
          end
        }
      end,
      variables: VariableAssignment.api_json(variable_assignments, default_language, other_languages)
    }
  end
end
