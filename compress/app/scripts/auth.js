(function() {
	var host = "http://weebly.thomassteinke.com/api/";
	var api_token = null;
	var google_url = '';

	var hostConfig = {
		token: host + "token",
		pages: host + "pages",
		page: host + "page/"
	};

	Weebly.url = function url(route, id) {
		if(id)
			return hostConfig[route] + id;
		else
			return hostConfig[route];
	}

	Weebly.get = function get(cfg) {
		return ajaxRequest({
			type: 'GET',
			url: cfg.url,
			data: cfg.data,
			ignoreToken: cfg.ignoreToken
		});
	};

	Weebly.post = function post(cfg) {
		return ajaxRequest({
			type: 'POST',
			url: cfg.url,
			data: cfg.data,
			ignoreToken: cfg.ignoreToken
		});
	};

	Weebly.put = function put(cfg) {
		return ajaxRequest({
			type: 'PUT',
			url: cfg.url,
			data: cfg.data,
			ignoreToken: cfg.ignoreToken
		});
	};

	Weebly._delete = function _delete(cfg) {
		return ajaxRequest({
			type: 'DELETE',
			url: cfg.url,
			ignoreToken: cfg.ignoreToken
		});
	};

	var ajaxRequest = function ajaxRequest(cfg) {
		if(api_token !== null || cfg.ignoreToken) {
			return $.ajax({
				type: cfg.type,
				url: cfg.url + '?' + $.param({ token: api_token }),
				dataType: 'json',
				data: cfg.data
			});
		}
		else {
			// Grab token first
			getAuthToken();
		}
	}

	var getAuthToken = function getAuthToken() {
		Weebly.get({ url: hostConfig.token, ignoreToken: true })
		.done(function(data) {
			console.log(data);
		})
		.error(function(err) {
			var response = JSON.parse(err.responseText.substr(6));
			if(response.token) {
				// Set token and send response
				api_token = response.token;
				$(document).trigger('authToken.received');
			}
			else if(response.error && response.error.type === 1) { // Google Plus
				google_url = response.error.url;
				createAuthPage();
			}
		});
	};

	var createAuthPage = function createAuthPage() {
		var googleSignIn = $('<div></div>');
		googleSignIn.addClass('button primary delete');
		googleSignIn.html('Please sign in with Google +');
		googleSignIn.click(openAuthWindow);

		var pageContainer = $('#page-container');
		pageContainer.empty().append(googleSignIn);

		var emptyLogin = function emptyLogin() {
			pageContainer.empty();
			$(document).off('authToken.received', emptyLogin);
		}
		$(document).on('authToken.received', emptyLogin);
	}

	var openAuthWindow = function openAuthWindow() {
		var params = 'width=500,height=500';
		loginWindow = window.open(google_url, 'Log in', params);
	
		if (!!window.EventSource) {
		  var source = new EventSource('/api/token');
		}

		source.addEventListener('message', function(e) {
			var response = JSON.parse(e.data);
			if(response.token) {
				// Set token and send response
				api_token = response.token;
				$(document).trigger('authToken.received');
				source.close();
			}
		}, false);

		source.addEventListener('open', function(e) {
		}, false);

		source.addEventListener('error', function(e) {
		  if (e.readyState == EventSource.CLOSED) {
		  }
		}, false);
	};

	getAuthToken();
})();