var db = null;

angular.module('starter.controllers', ['ionic', 'ngCordova'])


.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  if (window.cordova) {
          db = $cordovaSQLite.openDB({ name: "mobiledb.db" }); //device
        }else{
          db = window.openDatabase("mobiledb", '1', 'mobile', 1024 * 1024 * 100); // browser
        }
// // 
         $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS scanned");
         $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS scannedtwo");
         $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS scanned (id integer primary key, FName text, bib integer, eventName text, station text, date integer)");
         $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS scannedtwo (id integer primary key, FName text, bib integer, eventName text, station text, date integer)");
  });
})



.controller('DashCtrl', function($scope) {})


.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})



.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})



.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})


.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})






//FOR THE SCANNER __________________________________________________________________________________

.controller("AccountCtrl", function($scope, $cordovaBarcodeScanner, $cordovaSQLite, $http){

$scope.othername = function() {
    var input = document.getElementById("userInput").value;
    alert("You are now registered to Station " + input);

var stationtitle = document.getElementById("stationname");  
var stationtop = "You're using Station "+input;
stationtitle.innerHTML = stationtop;
}



$scope.sendto = function(){
    function selectAlltwo () {
        var query = "SELECT FName, bib, date FROM scannedtwo order by date desc";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
        
       var pairingtwo = document.getElementById('pairstwo');
     var working = "<tr><th><h4><b>Name</b></h4></th>  <th><b><h4>Bib ID</b></h4></th>  <th><b><h4>Time</b></h4></th></tr>\n";
       

        if(res.rows.length > 0){
                for(var i = 0; i < res.rows.length; i++) {
                  working += renderTodo(res.rows.item(i));
                       }
                         pairingtwo.innerHTML = working;
                      
                               }


                  function renderTodo(row) {
                        return "<tr><td>" + row.FName + "</td>\n<td>"+row.bib +  "</td>\n<td>"  +row.date +" </td></tr>\n";
                       // pairs += "<tr><td>"+key+"</td>\n<td>"+localStorage.getItem(key)+"</td></tr>\n";
                       }    
                    });
             }



     var pairing = document.getElementById('pairs');
      var query = "SELECT * FROM scanned";

            $cordovaSQLite.execute(db, query, []).then(function(res) {

                  var len = res.rows.length;
                  alert( len + " result/s found.");

                       var present = "";
                       var postdatarr = [];
                              for(var i = 0; i < res.rows.length; i++) {
                                     postdatarr.push(
                                        JSON.parse(
                                          renderTodo(
                                             res.rows.item(i)
                                )
                          )
                    );
                }
                             function renderTodo(row) {
                                 return '{"FName":"'+row.FName+'","bibid":"'+row.bib+'","EventName":"'+row.eventName+'", "Date":"'+row.date+'", "Station":"'+row.station+'"}'
                            }


                                    $http.post(
                                       'https://api.mongolab.com/api/1/databases/trailrush/collections/stats?apiKey=GW6gU4IP3dpT2bjwSyg0UKj8nDzGX0t1', 
                                          postdatarr
                                          )
                                              .success(function(){
                                                alert("Scanned result/s sent!");
                                                $cordovaSQLite.execute(db, "DELETE FROM scanned");
                                                selectAlltwo();
                                                pairing.innerHTML = "";
                                                counter.innerHTML = "0";
                                               })
                                              .error(function(){
                                                 console.log(arguments);
                                                 console.log("awwww");
                                               });
                  });

          }



$scope.insertdatako = function(){
     $cordovaBarcodeScanner.scan().then(function(imageData){
        var input = document.getElementById("userInput").value;
            var json = imageData.text;
            var datel =  Date.now(); 
            var date = datel / 1000;

            var obj = JSON.parse(json);

                  // bagong insert na data __________________________________________________________
                      obj.Date = date;
                      obj.Station = input;


var unix_timestamp = date;
var dater = new Date(unix_timestamp*1000);
var minutes = "0" + dater.getMinutes();
var seconds = "0" + dater.getSeconds();
var hours = dater.getHours();
var formattedTime = hours + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2);


                            var json = JSON.stringify(obj);
                            var parameters = [obj.FName, obj.bibid, obj.EventName, obj.Station, obj.Date];
                            var parameterstwo = [obj.FName, obj.bibid, obj.EventName, obj.Station, formattedTime];
                            alert("Name: "+obj.FName+"\n"+"Bib ID: "+obj.bibid+"\n"+"Time: "+ formattedTime);
                             

                            insert();
                            inserttwo();
                            selectAll();
                            


function insert(){
      
    var parameters = [obj.FName, obj.bibid, obj.EventName, obj.Station, obj.Date];
    var query = "INSERT INTO scanned(FName, bib, eventName, station, date) VALUES (?,?,?,?,?)";

    $cordovaSQLite.execute(db, query, parameters).then(function(res){
      // alert("insertid: "+res.insertId);
      }),function(err){
              console.log(err);
    }
   }



function inserttwo(){
      
    var parameterstwo = [obj.FName, obj.bibid, obj.EventName, obj.Station, formattedTime];
    var query = "INSERT INTO scannedtwo(FName, bib, eventName, station, date) VALUES (?,?,?,?,?)";
    
    $cordovaSQLite.execute(db, query, parameterstwo).then(function(res){
    
      }),function(err){
             console.log(err);
    }
   }



function selectAll () {

        var query = "SELECT FName, bib FROM scanned";
        $cordovaSQLite.execute(db, query, []).then(function(res) {

  var counter = document.getElementById('counter');
  var len = res.rows.length;
  counter.innerHTML = len;

  
               });
            }

      });
   } // end of insertdatako()







  });
