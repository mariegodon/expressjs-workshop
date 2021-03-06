// load the mysql library
var mysql = require('mysql');
var util = require('util');
var moment = require('moment');
require('longjohn');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'mariegodon',
    password: '',
    database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.get('/hello', function(req, res) {
    res.send('<h1>Hello World!</h1>')
});

app.get('/hello/:name', function(req, res) {
    res.send(`<h1>Hello ${req.params.name}!</h1>`)
});

function performOperation(op, num1, num2, callback) {
    var opObj = {
        operator: op,
        firstOperand: num1,
        secondOperand: num2
    }

    switch (op) {
        case "add":
            opObj.solution = num1 + num2;
            break;
        case "sub":
            opObj.solution = num1 - num2;
            break;
        case "mult":
            opObj.solution = num1 * num2;
            break;
        case "div":
            opObj.solution = num1 / num2;
            break;
        default:
            callback(op);
            return;
    }

    callback(null, opObj);
}

app.get('/calculator/:operation', function(req, res) {
    var operation = req.params.operation;
    var num1 = Number(req.query.num1);
    var num2 = Number(req.query.num2);
    performOperation(operation, num1, num2, function(err, result) {
        if (err) {
            res.status(400).send('Invalid operation!');
        }
        else {
            res.send(result);
        }
    });
});

function postsInHTML(result) {
    var htmlPosts = `<div> <h1>List of Posts</h1> <ul>`;
    result.forEach(function(post) {
        var thisPostHtml =
            `<li>
            <h4>${post.title} </h4>
                <p>user: ${post.user.username} <br>
                    url: ${post.url} <br>
                    id: ${post.id} <br>
                    created at: ${moment(post.createdAt).fromNow()} <br>
                </p>
        </li>`;
        htmlPosts += thisPostHtml;
    });
    return (`${htmlPosts}</ul></h1></div>`);
}

app.get('/posts', function(req, res) {
    redditAPI.getAllPosts({
        numPerPage: 5
    }, function(err, result) {
        if (err) {
            res.status(500).send('Error!');
        }
        else {
            res.send(postsInHTML(result));
        }
    });
});

app.get('/createContent', function(req, res) {
    res.sendFile('./form.html', {
        root: __dirname
    }, function(err, result) {
        if (err) {
            res.status(500).send('Error!');
        }
        else {
            return;
        }
    });
});

app.post('/createContent', function(req, res) {
    redditAPI.createPost({
            userId: 1,
            title: req.body.title,
            url: req.body.url
        },
        function(err, result) {
            if (err) {
                console.log(err);
                res.status(500).send('Error!');
            }
            else {
                res.redirect(`../posts/${JSON.stringify(result.id)}`);
            }
        }
    )
});

app.get('/posts/:postId', function(req, res){
    var postId = Number(req.params.postId);
    redditAPI.getSinglePost(postId, function(err, post){
        if (err){
            res.status(400).send('Post does not exist!');
        } else {
            res.send(JSON.stringify(post));
        }
    });
});

/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
