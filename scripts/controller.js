var app = angular.module('app', []);

var url = 'http://qxporest.azurewebsites.net/api/QXpoService/';


app.factory('personFactory', function ($http) {
    return {
        getWaitTime: function () {
            return $http.get(url + 'GetWaitTimeForAllRides');
        },
        updateRide: function (info) {
            return $http.post(url + 'PostRideIDAndCoords', info);
        },
		createRide : function (info) {
            return $http.post(url + 'PostNewRideWithCoords', info);
        }
        /*  deletePerson: function (person) { 
                    return $http.delete(url + person.Id); 
                }, 
                updatePerson: function (person) { 
                    return $http.put(url + person.Id, person); 
                }  */
    };
});

app.factory('notificationFactory', function () {

    return {
        success: function () {
            toastr.success("Success");
        },
        error: function (text) {
            toastr.error(text, "Error!");
        }
    };
});

app.controller('IndexCtrl', function ($scope, personFactory, notificationFactory) {

        //makeCorsRequest();
        /* 	var xmlhttp;
	if (window.XMLHttpRequest)
	  {// code for IE7+, Firefox, Chrome, Opera, Safari
	  xmlhttp=new XMLHttpRequest();
	  }
	else
	  {// code for IE6, IE5
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	xmlhttp.onreadystatechange=function()
	  {
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
		var responseString =xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET",'http://localhost:1303/QXpoService.svc/GetWaitTimeForAllRides',true);
	xmlhttp.send(); */


        /* var successCallback = function (data, status, headers, config) { 
		notificationFactory.success(); 

		return personFactory.getWaitTime().success(getPeopleSuccessCallback).error(errorCallback); 
	}; */

	$scope.waitTimes = [];
	var PADDING = 0;
	var MAXWIDTH = 700;
	var MAXHEIGHT = 550;
	var stage = new Kinetic.Stage({
		container: 'container',
		width: MAXWIDTH,
		height: MAXHEIGHT
	});

	var layer = new Kinetic.Layer();
	var imageObj = new Image();
	//ADDING MAP
	imageObj.onload = function () {
		var map = new Kinetic.Image({
			x: 0,
			y: 0,
			image: imageObj,
			width: MAXWIDTH,
			height: MAXHEIGHT
		});
		layer.add(map);
		stage.add(layer);
	};
	imageObj.src = 'img/parkMap.jpg'; //http://www.walibi.com/belgium/be-en/park-map


	//GET WAITTIMES CALLBACK
	var getPeopleSuccessCallback = function (data, status) {
		var x2js = new X2JS();

		console.log("refreshing");
		$scope.waitTimes = data;
		//ADDING TITLE
		var titleLabel = new Kinetic.Label({
			x: 50,
			y: 50,
			opacity: 1
		});
		titleLabel.add(new Kinetic.Text({
			text: 'Q-Xposure',
			fontFamily: 'Arial',
			fontSize: 32,
			padding: 0,
			fill: 'gray'
		}));
		layer.add(titleLabel);

		$scope.waitTimes.forEach(function (node) {
			
			var coordX = node.coordinate.split(',')[0];
			var coordY = node.coordinate.split(',')[1]; //horrible
			var stageX = coordX * stage.getWidth() / 100 + PADDING;
			var stageY = coordY * stage.getHeight() / 100 + PADDING;
			var group = new Kinetic.Group();
			//CIRCLE START		
			var circle = new Kinetic.Circle({
				x: stageX,
				y: stageY,
				radius: 10,
				fill: 'white',
				stroke: 'black',
				strokeWidth: 1,
				name: node.rideID
			});

			//labelLeft START		
			var labelLeft = new Kinetic.Label({
				x: stageX,
				y: stageY,
				opacity: 0.9
			});

			var labelDir = "";
			if ((stage.getWidth() - stageX) < 100) {
				labelDir = "right";
			} else {
				labelDir = "left";
			}
			labelLeft.add(new Kinetic.Tag({
				fill: 'white',
				pointerDirection: labelDir,
				pointerWidth: 10,
				pointerHeight: 24,
				lineJoin: 'round'
			}));

			labelLeft.add(new Kinetic.Text({
				text: node.rideName+"\n"+node.waitTime + " mins",
				fontFamily: 'Calibri',
				fontSize: 14,
				padding: 2,
				fill: 'black'
			}));
			//IDLABEL START
			var idLabel = new Kinetic.Label({
				x: stageX - 8,
				y: stageY - 8,
				opacity: 1
			});
			idLabel.add(new Kinetic.Text({
				text: node.rideID,
				fontFamily: 'Calibri',
				fontSize: 16,
				padding: 0,
				fill: 'black'
			}));
			
			//GROUPS
			group.add(circle);
			group.add(labelLeft);
			group.add(idLabel);
			group.on('mouseover', function () {
				document.body.style.cursor = 'pointer';
			});
			group.on('mouseout', function () {
				document.body.style.cursor = 'default';
			});

			//FINALIZING
			if(coordX && coordY){
				layer.add(group);
			}
		});
		stage.add(layer);
		$scope.refreshFlag = false;
	};

	var errorCallback = function (data, status, headers, config) {
		notificationFactory.error(data.ExceptionMessage);
		alert("request failed!");
		$scope.refreshFlag = false;
		$scope.saveFlag= false;
	};
	$scope.refresh = function () {
		$scope.refreshFlag = true;
		var shapes = stage.find('Group');
		shapes.each(function (shape) {
			shape.destroy();
		});
		personFactory.getWaitTime().success(getPeopleSuccessCallback).error(errorCallback);
	};
	$scope.update = function () {
		$scope.saveFlag= true;
		var shapes = stage.find('Circle');
		var doUpdate = false;
		var updates = [];
		/* shapes.each(function(shape) {
				var shapeX = shape.x * 100 / stage.getWidth();
				var shapeY = shape.y * 100 / stage.getHeight();
				$scope.waitTimes.forEach(function (node) {
					var coordX = node.coordinate.split(',')[0];
					var coordY = node.coordinate.split(',')[1];
					if (shape.name == node.ride_id) {
						if (shapeX != coordX || shapeY != coordY) {
							doUpdate = true;
							var info = info+ "<entry>" +
										"<rideID>"+node.ride_id+"</rideID>" +
										"<coords>"+shapeX+","+shapeY+"</coords>" +
									"</entry>";
						}
					}
				});
		}); */
		
		$scope.waitTimes.forEach(function (node) {
					var coordX = node.coordinate.split(',')[0];
					var coordY = node.coordinate.split(',')[1];
					if (coordX && coordY){
						var shapes = stage.find('.'+node.rideID);
						shapes.each(function (shape){
							var shapeX = shape.getAbsolutePosition().x * 100 / stage.getWidth();
							var shapeY = shape.getAbsolutePosition().y * 100 / stage.getHeight();
							if (shapeX != coordX || shapeY != coordY) {
								doUpdate = true;
								
								updates.push({"rideID":node.rideID,"coords":shapeX.toString()+","+shapeY.toString(),"rideName":node.rideName});
							}
						});
					}
				});
		
		if (doUpdate){
			updates.forEach(function(update){
			console.log(update);
			personFactory.updateRide(update).success(updateRideSuccessCallback).error(errorCallback);
			});
		}else{
		$scope.saveFlag= false;
		}
	};
    var updateRideSuccessCallback = function (data, status) {
		console.log(data);
		$scope.refresh();
		$scope.saveFlag= false;
    };
	$scope.createNewRide = function (){
		$scope.flag = false;
		if($scope.createRideName){
			var coord= {"coord": "5,5"};
			personFactory.createRide(coord).success(createRideSuccessCallback).error(errorCallback);
		}
	}
	var createRideSuccessCallback = function (data, status) {
		console.log(data);
		var update = {"rideID":data.split('=')[1],"coords":"5,5","rideName":$scope.createRideName};
		personFactory.updateRide(update).success(updateRideSuccessCallback).error(errorCallback);
		$scope.createRideName="";
    }; 
	
	$scope.updateRideName = function (){
		$scope.flag2 = false;
		if($scope.newRideNameID && $scope.newRideName){
			$scope.waitTimes.forEach(function(node){
				if(node.rideID == $scope.newRideNameID){
					
					var update = {"rideID":$scope.newRideNameID,"coords":node.coordinate,"rideName":$scope.newRideName};
					personFactory.updateRide(update).success(updateRideSuccessCallback).error(errorCallback);
					$scope.newRideNameID = "";
					$scope.newRideName="";
				}
			});
			
		}
	}
});




function makeCorsRequest(data) {
    var url = 'http://localhost:1303/QXpoService.svc/UpdateRideIDAndCoords';

    var xhr = createCORSRequest('POST', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    // Response handlers.
    xhr.onload = function () {
        var text = xhr.responseText;
        //var title = getTitle(text);
        alert('Response from CORS request to ' + url);
    };

    xhr.onerror = function () {
        alert('Woops, there was an error making the request.');
    };

    xhr.send(data);
}

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);

    } else if (typeof XDomainRequest != "undefined") {

        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);

    } else {

        // Otherwise, CORS is not supported by the browser.
        xhr = null;

    }
    return xhr;
}