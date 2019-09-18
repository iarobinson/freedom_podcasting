namespace :utilities do

  desc "Add Users to Shows"
  task add_users_to_shows: :environment do
    @ian = User.where(email: "ian@testing.com").first
    @ali = User.where(email: "ali@testing.com").first
    @milo = User.where(email: "milo@testing.com").first
    @glambition = Show.where(title: "Glambition Radio with Ali Brown").first
    @love_affair_travel = Show.where(
      title: "Love Affair Travel Podcast - Stories of Adventure and Enterprise"
    ).first
    @love_affair_travel.users << [@milo, @ian]
    @glambition.users << [@ali, @ian]
  end
end
