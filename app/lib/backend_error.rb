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
      if error =~ /([\w\.:,\s]+)\[(.+)\]/
        {message: $1, path: $2.split(",").map{|s| s.gsub("\"","").strip}}
      end
    end
  end
end
