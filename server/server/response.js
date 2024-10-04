class Response {
    statusCode = 200; // Default status code
    statusTextMap = {
      200: 'OK',
      201: 'Created',
      202: 'Accepted',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      303: 'See Other',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      406: 'Not Acceptable',
      409: 'Conflict',
      417: 'Expectation Failed',
      500: 'Internal Server Error',
      501: 'Not Implemented',
      503: 'Service Unavailable'
      //... Add more status codes as needed
    }; // Map of status codes to status text
  
    headers = {}; // Initialize headers object
  
    constructor(socket) {
      this.socket = socket;
    }
  
    // Method to set status code
    status(code) {
      if (!(code in this.statusTextMap)) {
        throw new Error(`Invalid status code: ${code}`);
      }
      this.statusCode = code;
      return this;
    }
  
    // Method to set headers
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    }
  
    // Helper method to format headers
    formatHeaders() {
      return Object.keys(this.headers)
        .map(key => `${key}: ${this.headers[key]}`)
        .join('\r\n');
    }
  
    // Method to send a response with a body
    send(body) {
      const headers = this.formatHeaders();
      const response = `HTTP/1.1 ${this.statusCode} ${this.statusTextMap[this.statusCode]}\n${headers}\n\n${body}`;
      this.socket.write(response); // Send the complete response
      this.socket.end(); // End the connection
    }
  
    // Method to send only the status
    sendStatus(statusCode) {
      this.status(statusCode);
      this.send('');
    }
  
    // Send Json response
    json(data) {
      data = JSON.stringify(data);
      this.setHeader('Content-Type', 'application/json');
      this.send(data);
    }
  }
  
  module.exports = Response;