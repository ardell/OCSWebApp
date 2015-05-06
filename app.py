#!/usr/bin/env python


# for Parse interaction
from zipfile_infolist import print_info
import json,httplib,zipfile, urllib, os, dateutil.parser

# for uploads
from flask import Flask, request, redirect, url_for
from werkzeug.utils import secure_filename

# for viewing uploads 
from flask import send_from_directory

from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper

app = Flask(__name__, static_url_path='')

app.config['UPLOAD_FOLDER'] = '~/uploads'

try:
    import zlib
    compression = zipfile.ZIP_DEFLATED
except:
    compression = zipfile.ZIP_STORED

def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
  if methods is not None:
    methods = ', '.join(sorted(x.upper() for x in methods))
  if headers is not None and not isinstance(headers, basestring):
    headers = ', '.join(x.upper() for x in headers)
  if not isinstance(origin, basestring):
    origin = ', '.join(origin)
  if isinstance(max_age, timedelta):
    max_age = max_age.total_seconds()

  def get_methods():
    if methods is not None:
      return methods

    options_resp = current_app.make_default_options_response()
    return options_resp.headers['allow']

  def decorator(f):
    def wrapped_function(*args, **kwargs):
      if automatic_options and request.method == 'OPTIONS':
        resp = current_app.make_default_options_response()
      else:
        resp = make_response(f(*args, **kwargs))
      if not attach_to_all and request.method != 'OPTIONS':
        return resp

      h = resp.headers

      h['Content-Type'] = "application/json"  
      h['Access-Control-Allow-Origin'] = origin
      h['Access-Control-Allow-Methods'] = get_methods()
      h['Access-Control-Max-Age'] = str(max_age)
      if headers is not None:
        h['Access-Control-Allow-Headers'] = headers
      return resp

    f.provide_automatic_options = False
    return update_wrapper(wrapped_function, f)
  return decorator

@app.route('/clear')
def clear():
  files = os.listdir('.')
  for file in files:
    if file.endswith(".jpg"):
        os.remove(file)
  
@app.route('/zip', methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def zip():
  objectId = request.form['objectId']
  modes = { zipfile.ZIP_DEFLATED: 'deflated',
            zipfile.ZIP_STORED:   'stored',
            }
 
  connection = httplib.HTTPSConnection('api.parse.com', 443)
  params = urllib.urlencode({"where":json.dumps({
         "$relatedTo": {
           "object": {
             "__type": "Pointer",
             "className": "Patient",
             "objectId": objectId
           },
           "key": "EyeImages"
         }
       })})
       
  connection.connect()
  connection.request('GET', '/1/classes/EyeImage?%s' % params, '', {
   "X-Parse-Application-Id": "kj1p0NcAg3KwmTebw5N4MtbZCkx2WASRWSxTWuto",
   "X-Parse-REST-API-Key": "YJD1kZut532YaYB5mnZRIgAu3M4ttbEgtCwVUsTt"
   })
  result = json.loads(connection.getresponse().read())
  eyeImageArray = result["results"]
  
  connection.request('GET', '/1/classes/Patient/%s' %objectId, '', {
   "X-Parse-Application-Id": "kj1p0NcAg3KwmTebw5N4MtbZCkx2WASRWSxTWuto",
   "X-Parse-REST-API-Key": "YJD1kZut532YaYB5mnZRIgAu3M4ttbEgtCwVUsTt"
   })
  patientInfo = json.loads(connection.getresponse().read())
  
  zipName = ""
  if "cellscope" in patientInfo:
    zipName += str(patientInfo["cellscope"])
  if "examID" in patientInfo:
    zipName += "-"+str(patientInfo["examID"])
  if "patientID" in patientInfo:
    zipName += "-"+str(patientInfo["patientID"])
  
  dateString = patientInfo["examDate"]["iso"]
  date = dateutil.parser.parse(dateString)
  dateFormattedString =  date.strftime("%Y%m%d")

  if dateFormattedString:
    zipName += "-"+dateFormattedString
  
  #If correct Zip name already exists then just return the URL!
  file_path = './static/'+zipName+'.zip'
  filename = zipName+'.zip'
  print file_path
  if os.path.exists(file_path):
    zipURL = "https://cellscope4-8080.terminal.com/"+zipName+'.zip'
    return json.dumps({"zipName": zipURL})
  
  fileName = zipName

  fileNamesArray=[]
  filerDownloader = urllib.URLopener()
  for index, ei in enumerate(eyeImageArray):
    if "Eye" in ei:
      fileName += "-" + ei["Eye"]
    if "Position" in ei:
      fileName += "-" + ei["Position"]
    fileName += "-"+ str(index) + ".jpg"
    fileNamesArray.append(fileName)
    filerDownloader.retrieve(ei["Image"]["url"], fileName)
    fileName = zipName
  print "index "+str(index)
  print index
  
  zipName += ".zip"
  
  print 'creating archive'
  
  zf = zipfile.ZipFile(zipName, mode='w') 
  try:
    for i in range(0,index+1):
      print "i "+str(i)
      print 'adding file%s with compression mode' %i, modes[compression]
      zf.write(fileNamesArray[i], compress_type=compression)
  finally:
    print 'closing'
    zf.close()
  
  for file in fileNamesArray:
    os.remove(file)
  
  print print_info(zipName)
  print "Printing zipName"
  print zipName
  
  zipURL = "https://cellscope4-8080.terminal.com/"+zipName
  
  sourcePath = "./"+zipName
  destinationPath = "./static/"+zipName
  
  os.rename(sourcePath,destinationPath)
  return json.dumps({"zipName": zipURL})

@app.after_request
def add_cors(resp):
    """ Ensure all responses have the CORS headers. This ensures any failures are also accessible
        by the client. """
    resp.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin','*')
    resp.headers['Access-Control-Allow-Credentials'] = 'true'
    resp.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS, GET'
    resp.headers['Access-Control-Allow-Headers'] = request.headers.get( 
        'Access-Control-Request-Headers', 'Authorization' )
    # set low for debugging
    if app.debug:
        resp.headers['Access-Control-Max-Age'] = '1'
    return resp

if __name__ == '__main__':
	app.debug = True
	app.run(host='0.0.0.0', port=8080)