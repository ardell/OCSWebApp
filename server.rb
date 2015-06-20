require 'rubygems'
require 'bundler/setup'
require 'sinatra'

module OCS
  class App < Sinatra::Base
    use Rack::Auth::Basic, "Please sign in" do |username, password|
      username == 'fletcher' and password == 'cellscope'
    end

    set :public_folder, File.dirname(__FILE__) + '/public'

    get '/' do
      File.read File.join('public', 'index.html')
    end
  end
end

