
var app = angular.module('app', []); 

var url = 'http://localhost:1303/QXpoService.svc/';


app.factory('personFactory', function ($http) { 
            return { 
                getWaitTime: function () { 
                    return $http.get(url+'GetWaitTimeForAllRides'); 
                }/* , 
                addPerson: function (person) { 
                    return $http.post(url, person); 
                }, 
                deletePerson: function (person) { 
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
	var getPeopleSuccessCallback = function (data, status) { 
				var x2js = new X2JS();
				
                var tobj = x2js.xml_str2json(data).string.__text; 
				$scope.waitTimes = x2js.xml_str2json(tobj);
    }; 
	
	var errorCallback = function (data, status, headers, config) { 
                notificationFactory.error(data.ExceptionMessage); 
    };
	personFactory.getWaitTime().success(getPeopleSuccessCallback).error(errorCallback); 
 });
 
 
 function makeCorsRequest() {
  var url = 'http://localhost:1303/QXpoService.svc/GetWaitTimeForAllRides';

  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;
    //var title = getTitle(text);
    alert('Response from CORS request to ' + url );
  };

  xhr.onerror = function() {
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