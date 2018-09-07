class Backend
  include HTTParty
  base_uri Settings.backend.url
  # debug_output $stdout

  class << self
    def version
      handle_response { get("/api/version") }
    end

    def bots
      handle_response { get("/api/bots") }.group_by { |bot| bot['id'] }
    end

    def create_bot(manifest, temp: false)
      body = {bot: {manifest: manifest, temp: temp}}.to_json
      headers = {"Content-Type" => "application/json"}
      handle_response { post("/api/bots", body: body, headers: headers) }['id']
    end

    def update_bot(uuid, manifest)
      body = {bot: {manifest: manifest}}.to_json
      headers = {"Content-Type" => "application/json"}
      handle_response { put("/api/bots/#{uuid}", body: body, headers: headers) }
    end

    def destroy_bot(uuid)
      handle_response { delete("/api/bots/#{uuid}") }
    end

    def session_data(uuid, period)
      if period == "none"
        handle_response { get("/api/bots/#{uuid}/session_data") }
      else
        handle_response { get("/api/bots/#{uuid}/session_data?period=#{period}") }
      end
    end

    def usage_summary(uuid, params = {})
      query = { period: :today }.merge(params)
      handle_response { get("/api/bots/#{uuid}/stats/usage_summary", query: query) }
    end

    def users_per_skill(uuid, params = {})
      query = { period: :today }.merge(params)
      handle_response { get("/api/bots/#{uuid}/stats/users_per_skill", query: query) }
    end

    def error_logs(uuid, query = {})
      handle_response { get("/api/bots/#{uuid}/error_logs", query: query) }
    end

    def sessions(uuid)
      handle_response { get("/api/bots/#{uuid}/sessions") }
    end

    def sessions_log(uuid, session_id)
      handle_response { get("/api/bots/#{uuid}/sessions/#{session_id}/log") }
    end

    def sessions_send_message(uuid, session_id, body)
      handle_response { post("/api/bots/#{uuid}/sessions/#{session_id}/send_message", body: body) }
    end

    def sessions_forward_messages(uuid, session_id, body)
      handle_response { put("/api/bots/#{uuid}/sessions/#{session_id}/forward_messages", body: body) }
    end

    def check_wit_ai_credentials(auth_token)
      query = { provider: :wit_ai, auth_token: auth_token }
      handle_response { get("/api/check_credentials", query: query) }
    end

    private

    def handle_response(&request)
      response = yield request
      if response.code >= 200 and response.code < 300
        if response.code == 204
          :ok
        elsif response.parsed_response.is_a?(Hash) && response.parsed_response.include?('data')
          response.parsed_response['data']
        else
          response.parsed_response
        end
      else
        raise BackendError.new(response)
      end
    end
  end
end
