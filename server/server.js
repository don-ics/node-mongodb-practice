const express = require('express');
const bodyParser = require("body-parser");

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {Users} = require('./models/user');


let app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (err) => {
		res.status(400).send(err)
	});
})

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	});
})

app.listen('3000', () => {
	console.log("Listening at port 3000");
});


module.exports = {app};