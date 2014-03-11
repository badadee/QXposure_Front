var app = angular.module('app', []);

var url = 'http://localhost:1303/QXpoService.svc/';


app.factory('personFactory', function ($http) {
    return {
        getWaitTime: function () {
            return $http.get(url + 'GetWaitTimeForAllRides');
        }
        , 
                addPerson: function (person) { 
                    return $http.post(url, person); 
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
    var stage = new Kinetic.Stage({
        container: 'container',
        width: 800,
        height: 800
    });

    var layer = new Kinetic.Layer();
	var imageObj = new Image();
	//ADDING MAP
    imageObj.onload = function() {
        var map = new Kinetic.Image({
          x: 0,
          y: 0,
          image: imageObj,
          width: 800,
          height: 800
        });
		layer.add(map);
		stage.add(layer);
	};
	imageObj.src = 'img/parkMap.jpg'; //http://www.walibi.com/belgium/be-en/park-map
	
	
	//GET WAITTIMES CALLBACK
    var getPeopleSuccessCallback = function (data, status) {
        var x2js = new X2JS();

        var tobj = x2js.xml_str2json(data).string.__text;
        $scope.waitTimes = x2js.xml_str2json(tobj).data.entry;
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
            var group = new Kinetic.Group({
                draggable: true
            });
	//CIRCLE START		
            var circle = new Kinetic.Circle({
                x: stageX,
                y: stageY,
                radius: 10,
                fill: 'white',
                stroke: 'black',
                strokeWidth: 1
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
                text: node.wait_time + " mins",
                fontFamily: 'Calibri',
                fontSize: 14,
                padding: 5,
                fill: 'black'
            }));
	//IDLABEL START
            var idLabel = new Kinetic.Label({
                x: stageX - 8,
                y: stageY - 8,
                opacity: 1
            });
            idLabel.add(new Kinetic.Text({
                text: node.ride_id,
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
            layer.add(group);
            
        });
		stage.add(layer);
    };
	
    var errorCallback = function (data, status, headers, config) {
        notificationFactory.error(data.ExceptionMessage);
		alert("getWaitTime failed!");
    };
    $scope.refresh = function(){
		var shapes = stage.find('Group');
		shapes.each(function (shape) {
			shape.destroy();
		});
		personFactory.getWaitTime().success(getPeopleSuccessCallback).error(errorCallback);
	}
	


});




function makeCorsRequest() {
    var url = 'http://localhost:1303/QXpoService.svc/GetWaitTimeForAllRides';

    var xhr = createCORSRequest('GET', url);
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

    xhr.send();
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