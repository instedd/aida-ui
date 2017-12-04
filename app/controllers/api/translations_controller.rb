class Api::TranslationsController < ApplicationApiController
  def index
    bot = current_user.bots.find(params[:bot_id])
    languages = bot.available_languages
    translations = bot.translations.where(lang: languages)
    keys = bot.translation_keys

    render json: translations_api_json(keys, languages, translations)
  end

  def update
    bot = current_user.bots.find(params[:bot_id])
    behaviour = bot.behaviours.find(params[:behaviour_id])
    valid_keys = behaviour.translation_keys.map do |key|
      key[:key]
    end
    if valid_keys.include?(params[:key])
      valid_languages = bot.available_languages
      if params[:lang] == valid_languages.first
        render json: {error: "Invalid language (default language, use skill endpoint)"},
               status: :bad_request
      elsif valid_languages.include?(params[:lang])
        translation = behaviour.translations.find_or_create_by!(key: params[:key],
                                                                lang: params[:lang])
        translation.update_attributes! value: params[:value]
        head :ok
      else
        render json: {error: "Invalid language #{params['lang']}"},
               status: :bad_request
      end
    else
      render json: {error: "Invalid translation key #{params['key']}"},
             status: :bad_request
    end
  end

  private

  def translations_api_json(translation_keys, languages, translations)
    default_language = languages.first
    translations_by_behaviour = translations.group_by(&:behaviour_id)

    {
      default_language: default_language,
      keys: translation_keys.map do |behaviour_keys|
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
            languages.drop(1).inject(result) do |memo, lang|
              translation = behaviour_translations.find do |t|
                t.lang == lang
              end
              memo[lang] = translation.value rescue ''
              memo
            end
          end
        }
      end
    }
  end
end
