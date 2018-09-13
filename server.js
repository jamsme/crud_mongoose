var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var path = require('path');
const flash = require('express-flash');
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

mongoose.connect('mongodb://localhost/bird_dashboard', { useNewUrlParser: true });
var BirdSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    breed: {type: String, required: true, minlength: 3},
    color: {type: String, required: true, minlength: 3},
}, {timestamps: true})
mongoose.model('Bird', BirdSchema); 
var Bird = mongoose.model('Bird');  

app.get('/', function(req, res){
    Bird.find({}, function(err, birds){
        if(err) {
            console.log("what went wrong")
        } else {
            console.log("go bird go!!!")
        }
        res.render('index', {birds: birds})
    });
});

app.post('/birds', function(req, res){
    var bird = new Bird({name: req.body.name, breed: req.body.breed, color: req.body.color});
    bird.save(function(err){
        if(err) {
            console.log('We have an error!', err);
            for(var key in err.errors){
                req.flash('registration', "Inputs needs to be at least 3 characters")
            }
            res.redirect('/birds/new');
        } else { 
            console.log('successfully added a bird!');
            res.redirect('/');
        }
    });
});

app.get('/birds/new', function(req, res){
    res.render('new')
});

app.get('/birds/edit/:id', function(req, res){
    Bird.findOne({_id: req.params.id}, function(err, birds){
        res.render('edit', {birds: birds})
    });
});

app.post('/edit/:id', function(req, res){
    Bird.update({_id: req.params.id}, req.body, function(err, birds){
        if(err){
            console.log('something went wrong');
            res.redirect(`/birds/edit/${req.params.id}`)
        } else {
            console.log('successfully edited!');
            res.redirect(`/birds/${req.params.id}`);
        }
    });
});

app.get('/birds/:id', function(req, res){
    Bird.findOne({_id: req.params.id}, function(err, birds){
        res.render('show', {birds: birds})
    });
});

app.get('/delete/:id', function(req,res){
    Bird.remove({_id: req.params.id}, function(err){
        res.redirect('/');
    })
});

app.listen(1700, function() {
    console.log("listening on port 1700");
});
