require "rails_helper"

RSpec.describe "deep links", type: :request do
  def deep_link_success(path)
    get path
    expect(response).to be_success
  end

  it "should be_success" do
    deep_link_success "/"
    deep_link_success "/b"
    deep_link_success "/b/42"
    deep_link_success "/b/42/channel"
  end
end
