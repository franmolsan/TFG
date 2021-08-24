class ApiResponse{

  // the data received as an object (Gamestate)
  late Object _data;

  // error object
  late Object _apiError;

  // error string
  late String _error;

  // Constructor
  //ApiResponse(this._data, this._apiError, this._error);


   // Getters
  Object get data => _data;
  Object get apiError => _apiError;
  String get error => _error;

  // Setters
  set data(Object value) {
    _data = value;
  }
  set apiError(Object value) {
    _apiError = value;
  }
  set error(String value) {
    _error = value;
  }
}