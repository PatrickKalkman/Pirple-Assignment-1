/*
 * Primary file for the API
 *
 */
'use strict';

// Dependencies
const http = require('http');
const url = require('url');
const HttpStatusCodes = require('./httpstatuscodes');

const getRequestTrimmedPathFromUrl = function (rawUrl) {
  const parsedUrl = url.parse(rawUrl, true);
  return parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
};

// Define the handlers
const handlers = {};

// Define the handler which is used when no handler can be found
handlers.notFound = function (data, callback) {
  callback(HttpStatusCodes.NOT_FOUND);
};

// Define the hello handler
handlers.hello = function (data, callback) {
  // The handler should only respond to post requests, otherwise call the not found handler
  if (data.httpMethod === 'post') {
    callback(HttpStatusCodes.OK, {
      'message': 'hello world'
    });
  } else {
    handlers.notFound(data, callback);
  }
};

// Define the routes and their handlers
const router = {
  'hello': handlers.hello
};

// Instantiate the server
const server = http.createServer(function (req, res) {

  const trimmedPath = getRequestTrimmedPathFromUrl(req.url);

  // Select the correct handler based on the given path
  var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ?
    router[trimmedPath] : handlers.notFound;

  const httpMethod = req.method.toLowerCase();
  
  // construct the data object to send to the handler
  var data = {
    'trimmedPath': trimmedPath,
    'httpMethod': httpMethod
  };

  // call the chosen handler with the data object
  chosenHandler(data, function(statusCode, payload) {

    // Set the content type to json
    res.setHeader('content-type', 'application/json');
    // Set the status code
    res.writeHead(statusCode);

    // Convert the payload to a string
    const payloadString = JSON.stringify(payload);
    // Return the payload
    res.end(payloadString);

  });
});

// Start the http server, and have it listen on port 3000
server.listen(3000, function () {
  console.log('The server is listening on port 3000');
});