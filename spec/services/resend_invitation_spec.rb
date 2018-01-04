require 'rails_helper'

RSpec.describe ResendInvitation, type: :service do
  let(:invitation) { create(:invitation) }

  before(:each) {
    clear_mail_deliveries
  }

  it "resends the invitation email" do
    ResendInvitation.run(invitation)
    expect(all_mail_deliveries.size).to eq(1)
    expect(all_mail_destinations).to include(invitation.email)
  end

  it "does nothing for anonymous invitations" do
    anonymous_invitation = create(:invitation, :anonymous)

    ResendInvitation.run(anonymous_invitation)
    expect(all_mail_deliveries).to be_empty
  end
end
