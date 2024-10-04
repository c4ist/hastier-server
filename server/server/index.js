const { httpParser } = require('../lib/httpParser.js');
const net = require('net');
const Response = require('./response.js');

/**
 * Creates a new server socket and returns it.
 * 
 * @param {function} callback - The callback function to handle incoming connections.
 * @param {object} context - The context object to pass to the callback function.
 * @returns {net.Server} The created server socket.
 */
function getSocket(callback, context) {
  return net.createServer((socket) => callback(socket, context));
}

/**
 * Handles incoming connections and parses the HTTP request.
 * 
 * @param {net.Socket} socket - The incoming socket connection.
 * @param {object} context - The context object containing the routes.
 */
function handler(socket, context) {
  socket.on('data', (data) => {
    try {
      const res = new Response(socket);
      const buff = data.toString('utf8'); // Specify the encoding to avoid security issues
      httpParser(buff)
        .then((parsedData) => {
          pathController(parsedData, context, res);
        })
        .catch((error) => {
          console.error('Error parsing HTTP request:', error);
          res.sendStatus(400);
        });
    } catch (error) {
      console.error('Error handling incoming connection:', error);
      res.sendStatus(500);
    }
  });
}

/**
 * Controls the routing of the HTTP request.
 * 
 * @param {object} data - The parsed HTTP request data.
 * @param {object} context - The context object containing the routes.
 * @param {Response} res - The response object.
 */
function pathController(data, context, res) {
  const path = data.path;
  const method = data.method;
  console.log(`pathController: ${method} ${path}`);

  const route = context.routes.find((route) => route.path === path && route.method === method);
  if (route) {
    route.callback(data, res);
  } else {
    res.sendStatus(404);
  }
}

/**
 * Represents a server that can handle HTTP requests.
 */
class Server {
  constructor(context) {
    this.socket = getSocket(handler, context);
    this.routes = [];
  }

  /**
   * Starts the server and listens for incoming connections.
   * 
   * @param {number} port - The port number to listen on.
   * @param {function} callback - The callback function to call when the server is listening.
   */
  listen(port, callback) {
    this.socket.listen(port, callback);
  }
}

/**
 * Represents a server that can handle HTTP requests with a simpler API.
 */
class Hasty extends Server {
  constructor(context) {
    super(context);
  }

  /**
   * Sets a new route for the server.
   * 
   * @param {string} method - The HTTP method to handle (e.g., GET, POST, PUT, DELETE).
   * @param {object} object - The route object containing the callback function and path.
   */
  setRoute(method, object) {
    const route = {
      callback: object.callback,
      path: object.path,
      method,
    };
    this.routes.push(route);
    console.log(this.routes);
  }

  /**
   * Sets a new GET route for the server.
   * 
   * @param {string} path - The path to handle.
   * @param {function} callback - The callback function to call when the route is matched.
   */
  get(path, callback) {
    this.setRoute('GET', { callback, path });
  }

  /**
   * Sets a new POST route for the server.
   * 
   * @param {string} path - The path to handle.
   * @param {function} callback - The callback function to call when the route is matched.
   */
  post(path, callback) {
    this.setRoute('POST', { callback, path });
  }

  /**
   * Sets a new PUT route for the server.
   * 
   * @param {string} path - The path to handle.
   * @param {function} callback - The callback function to call when the route is matched.
   */
  put(path, callback) {
    this.setRoute('PUT', { callback, path });
  }

  /**
   * Sets a new DELETE route for the server.
   * 
   * @param {string} path - The path to handle.
   * @param {function} callback - The callback function to call when the route is matched.
   */
  delete(path, callback) {
    this.setRoute('DELETE', { callback, path });
  }

  /**
   * Sets a new PATCH route for the server.
   * 
   * @param {string} path - The path to handle.
   * @param {function} callback - The callback function to call when the route is matched.
   */
  patch(path, callback) {
    this.setRoute('PATCH', { callback, path });
  }
}