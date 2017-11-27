class Backend
  include HTTParty
  base_uri Settings.backend.url

  class << self
    def version
      handle_response { get("/api/version") }
    end

    def bots
      handle_response { get("/api/bots") }.group_by { |bot| bot['id'] }
    end

    def create_bot(manifest)
      body = {bot: {manifest: manifest}}.to_json
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

    private

    def handle_response(&block)
      response = yield block
      if response.code >= 200 and response.code < 300
        if response.code == 204
          :ok
        else
          response.parsed_response['data']
        end
      else
        raise BackendError.new(response)
      end
    end
  end
end