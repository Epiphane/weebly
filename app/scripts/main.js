$(document).ready(function() {
	$('form').submit(function(event) {
		var form = $(this).serializeArray()[0];
		var data = {};
		data[form.name] = form.value;
		Weebly.post({
			url: Weebly.url('pages'),
			data: data
		})
		.done(function(data) {
			// Add it blindly for testing
			if(localhost) {
				console.log('New page: ' + form.value);
			}
			else {
				console.log(data.responseText);;
			}
		})
		.error(function(err) {
			console.log(err);
			console.log(err.responseText);
		});

		return false;
	});
});