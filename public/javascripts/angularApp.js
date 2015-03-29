angular.module('weatherNews', ['ui.router'])
.factory('postFactory', ['$http', function($http){
  var o = {
    posts: [],
    post: {}
  };
  o.getAll = function() {
    return $http.get('/posts').success(function(data) {
      angular.copy(data, o.posts);
    });
  };
  o.create = function(post) {
    return $http.post('/posts', post).success(function(data){
      o.posts.push(data);
    });
  };
  o.upvote = function(post) {
    console.log(post);
    return $http.put('/posts/' + post._id + '/upvote')
      .success(function(data) {
        post.upvotes +=1;
      });
  };
  o.getPost = function(id) {
    return $http.get('/posts/' + id).success(function(data) {
      angular.copy(data, o.post);
    });
  };
  o.addNewComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments/', comment);
  };
  o.upvoteComment = function(selPost, comment) {
    console.log("postFactory method received this post: ");
    console.log(selPost);
    console.log("\nAnd this comment: ");
    console .log(comment);
    return $http.put('/posts/' + selPost._id + '/comments/' + comment._id + '/upvote')
      .success(function(data) {
        comment.upvotes += 1;
      });
  };
  return o;
}])
.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('home', {
          url: '/home',
          templateUrl: '/home.html',
          controller: 'MainCtrl'
        })
        .state('posts', {
          url: '/posts/{id}',
          templateUrl: '/posts.html',
          controller: 'PostCtrl'
        });
    $urlRouterProvider.otherwise('home');
    }])

.controller('MainCtrl', [
    '$scope',
    'postFactory',
    function($scope, postFactory){
      postFactory.getAll();
      $scope.test = 'Hello World!';

      $scope.posts = postFactory.posts;

      $scope.addPost = function() {
        if($scope.formContent === '') {return;}
        postFactory.create({
          title: $scope.formContent,
        });
        $scope.formContent = '';
      };

      $scope.incrementUpvotes = function(post) {
        postFactory.upvote(post);
      };
    }
    ])
.controller('PostCtrl', [
    '$scope',
    '$location',
    '$stateParams',
    'postFactory',
    function($scope, $location, $stateParams, postFactory){
      console.log($stateParams);
      console.log(postFactory);
      var mypost = postFactory.posts[$stateParams.id];
      console.log(mypost);
      if(angular.isUndefined(mypost)) {
        console.log("I found the undefined value, I should try to re route now");
      $location.path('/home');
      }
      else {
      postFactory.getPost(mypost._id);
      $scope.post = postFactory.post;
      $scope.addComment = function(){
        console.log($scope.post);
        if($scope.body === '') { return; }
        postFactory.addNewComment(postFactory.post._id, {body: $scope.body})
          .success(function(comment) {
            mypost.comments.push(comment);
            postFactory.post.comments.push(comment);
          });
        $scope.body = '';
      };
      }


      $scope.incrementUpvotes = function(comment) {
        console.log("incrementUp " + postFactory.post._id + " comment "+ comment._id);
        postFactory.upvoteComment(postFactory.post, comment);
      };
    }]);
