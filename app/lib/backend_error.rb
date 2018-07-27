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
    if error == { 'path' => '#/skills', 'error' => { 'expected' => 1, 'actual' => 0 } }
      parsed_errors = [
        {
          :message => 'There needs to be at least one skill',
          :path => ['skills']
        }
      ]
    elsif error['message'] && (error['message'].start_with? 'Duplicated skills')
      parsed_errors = [
        {
          :message => error['message'],
          :path => ['skills'].concat(error['path'].map { |e| e[2..-1] })
        }
      ]
    else
      parsed_errors = parse_invalid_error(error)
    end
    parsed_errors
  end

  def self.parse_invalid_error(error)
    parsed_errors = []

    parent_path = error['path'][2..-1]
    invalid_errors = error['error']['invalid']
    invalid_errors = invalid_errors.select { |e| include_invalid_error(e) }

    invalid_errors.each do |invalid_error|
      parsed_errors.concat(invalid_error['errors']
        .reject { |e| e['error'] == {} }
        .map { |e| parse_child_error(parent_path, e) })
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
    case error['error']
    when { 'expected' => 1, 'actual' => 0 },
      { 'missing' => %w[question responses] }
      'required'
    else
      ''
    end
  end
end
