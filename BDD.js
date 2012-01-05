/**
 * A simple BDD style story interpretation
 * which will convert the story to a JSON request and policy
 * integration long term.
 */



var fs = require('fs');
var lazy = require("lazy");
var events = require('events');
var eventEmitter = new events.EventEmitter();
var jsonRequest = {
		subject: {},
		resource: {},
		action: {}
		
};

var policyToInsert = {
		
		// Part II
		
		
};

var nouns = ["to", "and", "it", "a"];
var previous;  // used to store the previous keyword so AND works.


eventEmitter.on("request", function(story)
		{
			console.log("Request received to translate story");
			
		interpret(story, function(result){
			

			setTimeout(function() {
				console.log(result);
				JSON.stringify(jsonRequest);	
				console.log("JSON");
				console.log(jsonRequest);
				    }, 2000);    

			
		
										});
		});

function interpret(input, result){
	
	new lazy(fs.createReadStream(input))
    .lines
    .forEach(function(line){
    	
    	   var words = line.toString().split(" ");
    	   line = line.toString();
    	   console.log(line);
    	   if(words[0] == "Story:")
    		   {
    		  
    		   Story(words[1], function(callback){
    				   
    			   console.log("Story processed");
    			   
    			   
    				   });
    		   }
    	 
    	   if(words[0] == "Scenario:")
		   {
		   Scenario(words[1], function(callback){
				   
			   console.log("Scenario processed");
			   
			   
				   });
		   }
    	   
    	   if(words[0] == "Given")
		   {
    		   previous = "Given";
		   Given(line.substr(line.indexOf(" ") +1), function(callback){
				   
			   console.log("Given processed");
			   
			   
				   });
		   }
 
    	   
    	   if(words[0] == "When")
		   {
    		   previous = "When";
		   When(line.substr(line.indexOf(" ") +1), function(callback){
				   
			   console.log("When processed");
			   
			   
				   });
		   }
 
    	   
    	   if(words[0] == "Then")
		   {
    		   console.log("In the then");
    		   previous = "Then";
		   Then(line.substr(line.indexOf(" ") +1), function(callback){
				   
			   console.log("Then processed");
			   
			   
				   });
		   }
 
    	   
    	   if(words[0] == "And")
		   {
    		   
		   And(line.substr(line.indexOf(" ") +1), function(callback){
				   
			   console.log("And processed");
			   
			   
				   });
		   }
 
 
    }
);

	
	
	result("Successfully converted story to JSON");
	
};





function Story(story, callback)
{
jsonRequest.id = story;
console.log(story);
callback("done");

}

function Scenario(scenario, callback)
{
jsonRequest.ruleID = scenario;
console.log(scenario);
callback("done");

}

function Given(sentence, callback)
{
	console.log(sentence);
	// Resource is the target we want to edit
	 var words = sentence.split(" ");
	 
	 for(var i = 0; i < words.length;i++)
		 {
		
		 var x = words[0] in nouns;
		 console.log("XXX " + x);
		 if((words[0] in nouns) === true)
			 {
			 console.log(words[0] + " is a noun");
			 }
		
		 }
	
	callback("done");

}

function When(sentence, callback)
{
	console.log(sentence);
	callback("done");

}

function Then(sentence, callback)
{
	console.log(sentence);
	callback("done");

}

function And(sentence, callback)
{
	console.log(sentence);
	callback("done");

}




	 eventEmitter.emit("request", './test.story');
	  




