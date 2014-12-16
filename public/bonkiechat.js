var socket = io();

var b = $('.berichten');
b[0].scrollTop = b[0].scrollHeight;

var i = 0;

var f = true;
$(window).focus(function () { 
	f = true;
	i = 0;
	$('title').text('Bonkiechat');
}).blur(function () { 
	f = false; 
});

$('.letter input').focus()

$('.letter').submit( function () {
	if ($('.letter input').val().length > 0) socket.emit('letter', $('.letter input').val());
	$('.kies').remove();
	$('.nieuw input').removeAttr('disabled');
});

$('.nieuw').submit( function () {
	if ($('.nieuw input').val().length > 0) socket.emit('bericht', $('.nieuw input').val());
	$('.nieuw input').val('');
	return false;

});

socket.on('nieuw', function (bericht) {
	$('.berichten').append('<li><time>' + moment().format('HH:mm') + '</time><span>' + bericht.gebruiker + '</span>' + bericht.inhoud + '</li>');
	b[0].scrollTop = b[0].scrollHeight;

	if (f == false) {
		i = i + 1;
		$('title').text('(' + i + ') Bonkiechat');
	}
});

socket.on('aankomst', function (letter) {
	$('.berichten').append('<li><time>' + moment().format('HH:mm') + '</time><em>Zojuist is <strong>' + letter + '</strong> de Bonkiechat binnengekomen</em> &nbsp;</li>');
	b[0].scrollTop = b[0].scrollHeight;
});

socket.on('vertrek', function (letter) {
	$('.berichten').append('<li><time>' + moment().format('HH:mm') + '</time><em>Zojuist heeft <strong>' + letter + '</strong> de Bonkiechat verlaten</em> &nbsp;</li>');
	b[0].scrollTop = b[0].scrollHeight;
});