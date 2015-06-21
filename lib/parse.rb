class Parse

  def self.get(path)
    uri = [ self.endpoint, path ].join('/')
    response = RestClient.get(uri, self.headers)
    JSON.parse(response)
  end

  private

  def self.endpoint
    'https://api.parse.com'
  end

  def self.headers
    {
      'X-Parse-Application-Id' => 'kj1p0NcAg3KwmTebw5N4MtbZCkx2WASRWSxTWuto',
      'X-Parse-REST-API-Key'   => 'YJD1kZut532YaYB5mnZRIgAu3M4ttbEgtCwVUsTt',
    }
  end

end

