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
    errors.map do |error|
      if /\"(path)\"=>\"#\/(\w+)/ =~ error.to_s
        matches = error.to_s.scan(/\"path\"=>\"#\/(\w+[\/\w]*)/)
        {message: get_message(error), path: matches.map {|match| match[0]}}
      end
    end
  end

  private

  def self.get_message(error)
    message = ""
    if /\"error\"=>{\"expected\"=>1, \"actual\"=>0}}/ =~ error.to_s
      message = "required"
    end
    message
  end

end
