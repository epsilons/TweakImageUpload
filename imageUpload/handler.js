'use strict';

var AWS = require('aws-sdk');

var s3 = new AWS.S3();
var params = JSON.parse(event.body);

var s3Params = {
  Bucket: 'slsupload',
  Key:  params.name,
  ContentType: params.type,
  ACL: 'public-read',
};

// var uploadURL = s3.getSignedUrl('putObject', s3Params);


module.exports.requestUploadURL = (event, context, callback) => {
  var s3 = new AWS.S3();
  var params = JSON.parse(event.body);

  var s3Params = {
    Bucket: 'slsupload',
    Key:  params.name,
    ContentType: params.type,
    ACL: 'public-read',
  };

  var uploadURL = s3.getSignedUrl('putObject', s3Params);

  callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.my-site.com'
    },
    body: JSON.stringify({ uploadURL: uploadURL }),
  })
}



module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
