class Backend
  include HTTParty
  base_uri Settings.backend.url

  def version
    handle_response { self.class.get("/api/version") }
  end

  def bots
    handle_response { self.class.get("/api/bots") }.group_by { |bot| bot['id'] }
  end

  def create_bot(manifest)
    body = {bot: {manifest: manifest}}.to_json
    headers = {"Content-Type" => "application/json"}
    handle_response { self.class.post("/api/bots", body: body, headers: headers) }['id']
  end

  def update_bot(uuid, manifest)
    body = {bot: {manifest: manifest}}.to_json
    headers = {"Content-Type" => "application/json"}
    handle_response { self.class.put("/api/bots/#{uuid}", body: body, headers: headers) }
  end

  def destroy_bot(uuid)
    handle_response { self.class.delete("/api/bots/#{uuid}") }
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
