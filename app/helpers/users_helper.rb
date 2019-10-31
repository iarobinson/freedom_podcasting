module UsersHelper
  def fetch_producer(users_array)
    users_array.to_a.each do |user|
      if user.role == "producer"
        return user
      end
    end
  end
end
