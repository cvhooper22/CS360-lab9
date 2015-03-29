var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts) {
    if(err){ return next(err); }
    res.json(posts);
  });
});
/*GET posts page*/
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);
  post.save(function(err, post) {
    if(err){ return next(err); }
    res.json(post);
  });
});
/*Intermediate route to get post id to display*/
router.param('post', function(req, res, next, id) {
  console.log("I got to the POST param route");
  console.log("THE ID I GOT WAS: ");
  console.log(id);
  var query = Post.findById(id);
  query.exec(function (err, post){
    if(err) { return next(err); }
    if(!post) { return next(new Error("can't find post")); }
    req.post = post;
    return next();
  });
});

router.get('/posts/:post', function(req, res, next) {
  console.log("I am in the get route for /posts/:post");
  console.log("\nTHis is the post I got in the request: ");
  console.log(req.post);

   /*var query = Post.findById(id);
   //query.exec(function (err, post){
    if(err) { return next(err); }
    if(!post) { return next(new Error("can't find post")); }
  
     });*/
  req.post.populate('comments', function(err, post) {
    res.json(req.post);
  });

});

router.put('/posts/:post/upvote', function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }
    res.json(post);
  });
});

router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment) {
    if(err) { return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }
      
      res.json(comment);
    });
  });
});
//upvote a comment
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
  console.log("in the put for a comment upvote");
  console.log("Comment info: ");
  console.log(req.comment);
  req.comment.upvote(function(err, comment) {
    if(err) { return next(err); }

    res.json(comment);
  });
});

router.param('comment', function(req, res, next, id) {
  //console.log("NOW I AM IN THE COMMENT PARAM MIDDLEWARE");
  //console.log("THE ID I GOT WAS: ");
  //console.log(id);
  var query = Comment.findById(id);

  query.exec(function(err, comment){
    if(err) { return next(err); }
    if(!comment) { return next(new Error("can't find comment")); }

    req.comment = comment;
    return next();
  });
});
