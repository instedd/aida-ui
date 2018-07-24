class BackendError < HTTParty::ResponseError
  def status_code
    response.code
  end

  def status_message
    response.message
  end

  def errors
    response.parsed_response['errors'] rescue []
  end

  def to_s
    "#{status_message} (#{status_code})"
  end

  def self.parse_errors(errors)
    skill_errors = errors.select{ |error| error['path'][2..7] == 'skills' || (error['path'].is_a?(Array) && error['path'].any? {|path| path[2..7] == 'skills'}) }
    channel_errors = errors.select{ |error| error['path'][2..9] == 'channels' || (error['path'].is_a?(Array) && error['path'].any? {|path| path[2..9] == 'channels'}) }

    other_errors = errors - skill_errors
    other_errors -= channel_errors
    out_errors = []

    channel_errors.each do |error|
      out_errors.concat(parse_invalid_error(error))
    end

    skill_errors.each do |error|
      out_errors.concat(parse_skill_error(error))
    end

    out_errors.concat(other_errors.map do |error|
        parse_error(error)
    end)

  end

  private_class_method

  def self.parse_skill_error(error)
    parsed_errors = []

    if error == {'path' => '#/skills', 'error' => {'expected' => 1, 'actual' => 0}}
      parsed_errors = [{:message=>"There needs to be at least one skill", :path=>["skills"]}]
    elsif error == {'path' => ['#/skills/1', '#/skills/0'], 'message' => 'Duplicated skills (language_detector)'}
      parsed_errors = [{:message=>"Language detector is duplicated", :path=>["skills", "skills/1", "skills/0"]}]
    else
      parsed_errors = parse_invalid_error(error)
    end
    parsed_errors
  end

  def self.parse_invalid_error(error)
    parsed_errors = []

    parent_path = error['path'][2..-1]
    invalid_errors = error['error']['invalid']
    invalid_errors = invalid_errors.select{ |error| include_invalid_error(error) }

    invalid_errors.each do |error|
      parsed_errors.concat(error['errors'].map {|error| parse_child_error(parent_path, error)})
    end

    parsed_errors
  end

  def self.include_invalid_error(error)
    error['errors'].all? { |sub_error| ['#/type', '#'].exclude?(sub_error['path']) }
  end

  def self.parse_child_error(parent_path, error)
    {
      message: get_message(error),
      path: [parent_path, error['path'][2..-1]]
    }
  end

  def self.parse_error(error)
    {
      message: get_message(error),
      path: [error['path'][2..-1]]
    }
  end

  def self.get_message(error)
    message = ''
    message = 'required' if error['error'] == {'expected' => 1, 'actual' => 0}
    message
  end
end
