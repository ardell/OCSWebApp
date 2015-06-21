require "#{Rails.root}/lib/parse.rb"

class PatientsController < ApplicationController

  include ActionController::Streaming
  include Zipline

  def stream_zip_archive
    @patient_id = params[:id]

    zip_prefix = _zip_prefix
    files      = _info_for_files

    # 404 if there aren't any images to send
    raise ActionController::RoutingError.new('Not Found') if files.empty?

    require 'open-uri'
    file_mappings = files
      .lazy  # Lazy allows us to begin sending the download immediately instead of waiting to download everything
      .map do |file|
        [
          open(file[:url]),
          [ zip_prefix, file[:eye], file[:position], file[:filename] ].join('/'),
        ]
      end
    zipline(file_mappings, "#{zip_prefix}.zip")
  end

  private

  def _zip_prefix
    path = "/1/classes/Patient/#{@patient_id}"
    response_obj = Parse::get(path)

    date = nil
    if response_obj and response_obj["examDate"] and response_obj["examDate"]["iso"]
      parsed_date = Date.parse(response_obj["examDate"]["iso"])
      date = parsed_date.strftime("%Y%m%d")
    end

    components = [
      response_obj["cellscope"],
      response_obj["examID"],
      response_obj["patientID"],
      date,
    ]
    components
      .reject {|o| o.nil? or (o.respond_to?(:length) and o.empty?) }
      .join('-')
  end

  def _info_for_files
    query = URI.escape("where=" + JSON.generate({
      "$relatedTo" => {
        object: {
          "__type" => "Pointer",
          className:  "Patient",
          objectId:   @patient_id,
        },
        key: "EyeImages",
      }
    }))
    path = "/1/classes/EyeImage?#{query}"

    response_obj = Parse.get(path)
    response_obj["results"]
      .map {|result|
        {
          eye:      result["Eye"],
          position: result["Position"],
          filename: result["Image"]["name"],
          url:      result["Image"]["url"],
        }
      }
  end
end

