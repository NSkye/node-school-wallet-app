const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser')
const luhn = (num) => {
	console.log('Checking card number: '+num);
	num = num.split('').reverse();
	let i = 1;
	console.log('Check-digit: '+num[0]);
	while (num[i]) {
		if (i%2===0) {
			let newNum = (Number(num[i])*2).toString();
			if (newNum.length>1)
				newNum = (Number(newNum[0])+Number(newNum[1])).toString();
			num[i]=newNum;
		}
	i++;
	}
	num = num.reduce((a, b) => Number(a)+Number(b));
	console.log('Final sum: '+num);
	if (num%10)
		return false;
	else
		return true;
}

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

app.get('/cards', (req, res) => {
	fs.open('source/cards.json', 'r', (err, fd) => {
		if (err) throw err;
		fs.readFile(fd, 'utf8', (err, data) => {
			if (err) throw err;
			res.json(JSON.parse(data));
			fs.close(fd, () => {console.log('file closed')});
		});
	});
});

app.use(bodyParser.json());

app.post('/cards', (req, res)=>{
	const card = req.body;
	const validCard = card && card.cardNumber && /^[0-9]+$/.test(card.cardNumber) && luhn(card.cardNumber) && card.balance && /^[0-9]+$/.test(card.balance);
	if (!validCard) {
		res.statusCode = 400;
		return res.end('400 Bad request');
	} else {
		res.json(req.body);
	}
});

app.listen(3000, () => {
	console.log('YM Node School App listening on port 3000!');
});
