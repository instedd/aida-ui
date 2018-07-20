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
    skills_errors = errors.select{ |error| error['path'][2..7] == 'skills' }
    other_errors = errors - skills_errors
    out_errors = []

    skills_errors.each do |error|
      out_errors.concat(parse_skill_invalid_error(error))
    end

    out_errors.concat(other_errors.map do |error|
      if %r{"path"=>"#/\w+[/\w]*"} =~ error.to_s
        matches = error.to_s.scan(%r{"path"=>"#/(\w+[/\w]*)"})
        {message: get_message(error), path: matches.map {|match| match[0]}}
      end
    end)

  end

  def self.parse_skill_invalid_error(error)
    parsed_errors = []

    if error.to_s == "{\"path\"=>\"#/skills\", \"error\"=>{\"expected\"=>1, \"actual\"=>0}}"
      parsed_errors = [{:message=>"There needs to be at least one skill", :path=>["skills"]}]
    else
      skill_path = error['path'][2..-1]
      skill_invalid_errors = error['error']['invalid']
      skill_invalid_errors = skill_invalid_errors.select{ |error| include_invalid_error(error) }
      parsed_errors = skill_invalid_errors[0]['errors'].map {|error| get_skill_error(skill_path, error)} if skill_invalid_errors.any?
    end
    parsed_errors
  end

  def self.include_invalid_error(error)
    error['errors'].all? { |sub_error| ['#/type', '#'].exclude?(sub_error['path']) }
  end

  def self.get_skill_error(skill_path, error)
    {
      message: get_message(error),
      path: [skill_path, error['path'][2..-1]]
    }
  end

  def self.get_message(error)
    message = ''
    message = 'required' if /\"error\"=>{\"expected\"=>1, \"actual\"=>0}}/ =~ error.to_s
    message
  end

  private_class_method :method
end
