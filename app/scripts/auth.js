var Weebly = {};

(function() {
	// Local testing?
	if(localhost) {
		Weebly.get = Weebly.post = Weebly.put = Weebly.delete = Weebly.update
		= Weebly.url = function() {
			console.log('You can\'t do that on localhost!');

			return {
				done: function(callback) {
					callback({});

					return {
						error: function(callback) {
						}
					};
				}
			};
		};

		return;
	}

	var host = "/api/";
	var api_token = null;

	var hostConfig = {
		token: host + "token",
		pages: host + "pages",
		page: host + "page/"
	};

	Weebly.url = function url(route) {
		return hostConfig[route];
	}

	Weebly.get = function get(cfg) {
		return $.ajax({
			type: 'GET',
			url: cfg.url,
			dataType: 'json',
			data: {
				token: api_token
			}
		});
	};

	Weebly.post = function post(cfg) {
		return $.ajax({
			type: 'POST',
			url: cfg.url,
			dataType: 'json',
			data: $.extend(cfg.data, {
				token: api_token
			})
		});
	};

	Weebly.put = function put(cfg) {
		return $.ajax({
			type: 'PUT',
			url: cfg.url,
			dataType: 'json',
			data: $.extend(cfg.data, {
				token: api_token
			})
		});
	};

	var getAuthToken = function getAuthToken() {
		Weebly.get({ url: hostConfig.token })
		.done(function(data) {
			console.log(data);
		})
		.error(function(err) {
			var response = JSON.parse(err.responseText.substr(6));
			if(response.token) {
				api_token = response.token;
			}
			else if(response.error && response.error.type === 1) { // Google Plus
				$("#page-container a").click(function() {
					var params = 'width=500,height=500';
					loginWindow = window.open(response.error.url, 'Log in', params);
				
					if (!!window.EventSource) {
					  var source = new EventSource('/api/token');
					}

					source.addEventListener('message', function(e) {
						var response = JSON.parse(e.data);
						if(response.token) {
							api_token = response.token;
							source.close();
						}
					}, false);

					source.addEventListener('open', function(e) {
					}, false);

					source.addEventListener('error', function(e) {
					  if (e.readyState == EventSource.CLOSED) {
					  }
					}, false);
				});
			}
		});
	};

	getAuthToken();
})();