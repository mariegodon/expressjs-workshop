var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.get('/hello', function(req, res) {
    res.send('<h1>Hello World!</h1>')
});

app.get('/hello/:name', function(req, res) {
    res.send(`<h1>Hello ${req.params.name}!</h1>`)
});

function performOperation(op, num1, num2, callback){
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
            opObj.solution = num1/num2;
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
    performOperation(operation, num1, num2, function(err, result){
        if (err) {
            res.status(500).send('Invalid operation!');
        } else {
            res.send(JSON.stringify(result));
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
