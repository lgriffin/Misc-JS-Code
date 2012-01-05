/**
 * Generate 100k lat / lon co-ordinates
 */

// 0 = aaa
// 1 = aab
// 2 = aac
//..
// 25 = aaz
// 26 = aba
var num_users = 1;
var fs = require('fs');
var path = "./geoloc.txt";  // our location for the input geoloc documents
var geoLocations = [];  // what we will place the formatted locations in [lat,lon] is the format
var gsl = require("gsl"); // stats package
var ran = new gsl.Random(); // random generator
var lazy = require("lazy");  // for list processing
var letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];


/**
 * This happens after a few seconds to make sure the geoLocations file is read in and the list populated
 */	
setTimeout(function(){
outer:
for(var i=0;i<=25;i++)
	{

		inner:
		for(var j=0;j<=25; j++)
			{
	
				most:
				for(var k=0; k<=25;k++)
					{
						for(var l =0; l<=25;l++)
							{
							
							
							
						if(num_users == 100000)
							{
							console.log(num_users + " is the value for num_users so breaking");
						
							break outer;
							}
						else
							{
						console.log("Here");	
						var hasResources =	Math.floor(Math.random()*1000);
						var resource = "false"; // default
						if(hasResources >= 950)
							{
							var checkinObject = {
									"checkin" : {
												"type" :
													{
													
													}
										
									},
									"context" : {
										"location" : {
											
										}
										
									},
									"resources" : {
										
									}
											
									};
							resource == "true";
							}
						else
							{
							
							
							var checkinObject = {
									"checkin" : {
										"type" :
										{
										
										}
										
									},
									"context" : {
													"location" : {
														
													}
										
									}
											
									};
							
							}
						
						var injuryType = Math.floor(Math.random()*10);
						
						if(injuryType%2 == 0)
							{
							checkinObject.checkin.type.fracture = "isTrue";
							}
						
						else
							{
							checkinObject.checkin.type.cut = "isTrue";
							}
						
							
							checkinObject.checkin.queue = "health";
							
							checkinObject.checkin.type.type = "arm";  // random
							
							var severity = Math.floor(Math.random()*11);
						//	console.log(checkinObject);
						//	console.log(geoLocations[num_users][0]);
						//	console.log(geoLocations[num_users][1]);
							checkinObject.checkin.type.user_rated_severity = severity;
							checkinObject.context.name = letters[i]+letters[j]+letters[k]+letters[l];
							checkinObject.context.location.latitude = geoLocations[num_users][0];
							checkinObject.context.location.longitude = geoLocations[num_users][1];
							
							if(resource == "true")
								{
								checkinObject.resources = ["first-aid", "blanket", "shelter"];
								}
						


							var checkinJSON = JSON.stringify(checkinObject);					
							writeToFile(num_users, checkinJSON);
							 num_users++;
							}
							
					}	
						
						}
							
					
			
	
			}
	

	}


},15000);


/*
 * Write the json to the disk. As a seperate function for scope reasons
 */
function writeToFile(fileNum, data)
{
	
/*	fs.writeFile("./files/"+fileNum+".json", data, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	       
	    }
	}); 
	*/
	
	fs.writeFileSync("./files/"+fileNum+".json", data);
	console.log(fileNum);
}

/*
 * Our first function to fire populating our geoLocations
 */

var i = 0;
new lazy(fs.createReadStream(path))
.lines
.forEach(function(line){
 var s1 = line.toString();
 s1 = s1.substring(s1.indexOf(',')+1,s1.length);
 
var lat = s1.substring(0,s1.indexOf(','));
 
s1 = s1.substring(s1.indexOf(',')+1,s1.length);
var lon = s1.substring(s1.indexOf(',')+1,s1.length-2);  // use the -2 to remove trailing // from the file

 geoLocations[i] = [lat,lon];
 console.log(geoLocations[i] + " " + i);
 i++;

}
);


/*
 * Finished / cleanup function if required
 */
setTimeout(function(){
	console.log('Finished');
},30000);




