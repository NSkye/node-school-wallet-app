const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const luhn = require('./luhn.js');
const DATA_SOURCE = './source/cards.json';
const getCards = () => require(DATA_SOURCE);

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.send(`<!doctype html>
	<html>
		<head>
			<link rel="stylesheet" href="/style.css">
		</head>
		<body>
			<h1>Hello Smolny!</h1>
		</body>
	</html>`);
});

app.get('/error', (req, res) => {
	throw Error('Oops!');
});

app.get('/transfer', (req, res) => {
	const {amount, from, to} = req.query;
	res.json({
		result: 'success',
		amount,
		from,
		to
	});
});


app.get('/cards', (req, res) => res.json(getCards()));

app.use(bodyParser.json());

app.post('/cards', (req, res)=> {
	const card = req.body;
	const validCard = card && card.hasOwnProperty('cardNumber') && card.hasOwnProperty('balance') && /^[0-9]+$/.test(card.cardNumber) && luhn(card.cardNumber) && /^[0-9]+$/.test(card.balance);
	if (!validCard) {
		res.statusCode = 400;
		return res.end('400 Bad request');
	}
	let cards = getCards()
	card.id = cards.length+1;
	cards.push(card);
	fs.writeFile(DATA_SOURCE, JSON.stringify(cards, null, 4), (err) => {
		if (err) throw err;
		res.json(card);
		console.log('Changes saved! Added card with id '+card.id+'.');
	});
});

app.listen(3000, () => {
	console.log('YM Node School App listening on port 3000!');
});
