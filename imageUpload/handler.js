'use strict';

const jwt = require('jsonwebtoken');

// Passed from `environment` of serverless.yml
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_PUBLIC_KEY = process.env.AUTH0_CLIENT_PUBLIC_KEY;

var AWS = require('aws-sdk');

// helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

// Authorizer function field in serverless.yml
// To authenticate calls before processing. 
/**
 * 
 * @param {*} event 
 * @param {*} context 
 * @param {*} callback 
 * returns auth token
 */

module.exports.auth = (event, context, callback) => {
  console.log('event', event);
  if (!event.authorizationToken) {
    return callback('Unauthorized');
  }

  const tokenParts = event.authorizationToken.split(' ');
  const tokenValue = tokenParts[1];

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    // no auth token!
    return callback('Unauthorized');
  }
  const options = {
    audience: AUTH0_CLIENT_ID,
  };

  try {
    jwt.verify(tokenValue, AUTH0_CLIENT_PUBLIC_KEY, options, (verifyError, decoded) => {
      if (verifyError) {
        console.log('verifyError', verifyError);
        // 401 Unauthorized
        console.log(`Token invalid. ${verifyError}`);
        return callback('Unauthorized');
      }
      // is custom authorizer function
      console.log('valid from customAuthorizer', decoded);
      return callback(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
    });
  } catch (err) {
    console.log('catch error. Invalid token', err);
    return callback('Unauthorized');
  }
};

/**
 * 
 * @param {*} event 
 * @param {*} context 
 * @param {*} callback 
 *  Stores image in s3 bucket
 */
module.exports.requestUploadURL = (event, context, callback) => {
  var s3 = new AWS.S3();
  var params = JSON.parse(event.body);

  var s3Params = {
    Bucket: 'tweakImages',
    Key:  params.name,
    ContentType: params.type,
    ACL: 'public-read',
  };

  var uploadURL = s3.getSignedUrl('putObject', s3Params);

  callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
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
