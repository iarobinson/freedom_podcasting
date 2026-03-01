class StorageService
  def initialize
    @client = Aws::S3::Client.new(
      access_key_id:     ENV.fetch("R2_ACCESS_KEY_ID"),
      secret_access_key: ENV.fetch("R2_SECRET_ACCESS_KEY"),
      endpoint:          ENV.fetch("R2_ENDPOINT"),
      region:            "auto",
      force_path_style:  true
    )
    @bucket       = ENV.fetch("R2_BUCKET")
    @public_base  = ENV.fetch("R2_PUBLIC_URL")
  end

  def presigned_upload_url(key:, content_type:, expires_in: 3600)
    Aws::S3::Presigner.new(client: @client).presigned_url(
      :put_object, bucket: @bucket, key: key, content_type: content_type, expires_in: expires_in
    )
  end

  def public_url(key) = "#{@public_base}/#{key}"
  def delete(key)     = @client.delete_object(bucket: @bucket, key: key)

  def upload_data(key:, data:, content_type:)
    @client.put_object(bucket: @bucket, key: key, body: data, content_type: content_type)
  end
end
