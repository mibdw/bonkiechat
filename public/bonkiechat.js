var socket = io();

var b = $('.berichten');
b[0].scrollTop = b[0].scrollHeight;

var i = 0;
var gebruikers = [];
var ikke = 0;

var f = true;
$(window).focus(function () { 
	f = true;
	i = 0;
	$('title').text('Bonkiechat');
}).blur(function () { 
	f = false; 
});

$('.letter input').focus()

$('form.letter').submit( function () {
	if ($('.letter input').val().length > 0) {
		socket.emit('letter', $('.letter input').val());
		ikke = $('.letter input').val().toUpperCase();
		$('.kies').remove();
		$('.nieuw input').removeAttr('disabled');
		return false;
	}
});

$('form.nieuw').submit( function () {
	if ($('.nieuw input').val().length > 0) {
		socket.emit('bericht', $('.nieuw input').val());
	 	$('.berichten').append('<li><time>' + moment().format('HH:mm') + '</time><span>' + ikke + '</span>' + $('.nieuw input').val() + '</li>');
		$('.nieuw input').val('');
		return false;
	}

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
	$('.berichten').append('<li><time>' + moment().format('HH:mm') + '</time><em>Zojuist is <strong>' + letter.gebruiker + '</strong> de Bonkiechat binnengekomen</em> &nbsp;</li>');
	gebruikers.push(letter.gebruiker);
	$('.overzicht').text('Nu online: ' + gebruikers.toString());
	b[0].scrollTop = b[0].scrollHeight;
});

socket.on('vertrek', function (letter) {
	$('.berichten').append('<li><time>' + moment().format('HH:mm') + '</time><em>Zojuist heeft <strong>' + letter + '</strong> de Bonkiechat verlaten</em> &nbsp;</li>');
	gebruikers.splice(gebruikers.indexOf(letter), 1);
	$('.overzicht').text('Nu online: ' + gebruikers.toString());
	b[0].scrollTop = b[0].scrollHeight;
});

socket.on('overzicht', function (overzicht) {
	gebruikers = overzicht;
	$('.overzicht').text('Nu online: ' + overzicht.toString());
});
