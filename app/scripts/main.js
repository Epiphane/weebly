$(document).ready(function() {
	$('form').submit(function(event) {
		var data = $(this).serializeArray()[0];

		return false;
	});
});