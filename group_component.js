/*
 * Methods working:
 * Join <GroupName>
 * create <GroupName>
 * help -- displays messages prompts
 * list  - for testing purposes
 * 
 * Outstanding:
 * add <JID> <GroupName>   : Some form of ownership check possibly todo
 * remove <JID> <GroupName>  : As above but leadership / owner issues
 * Stripping the resource and pulling in the bare JID is required on my end as well
 * 
 * Media Service integration 
 * DISCO lookups for other services
 * Database Hookup for persistence.
 * 
 */

var jid = "group", password = "hello";
var xmpp = require("../xmpp");
var conn = new xmpp.Connection();
var sys = require("sys");

var soccer = new Array("soccer","leigh@myserver", "sam@myserver", "bob@myserver");  //predefined groups, group name must be i[0]
var hurling = new Array("hurling", "frank@myserver", "leigh@myserver");
var basketball = new Array("basketball", "pat@myserver", "ian@myserver");

var groups = new Array(soccer, hurling, basketball);
var component_id = "group.loadtest.lab.tssg.org";


conn.log = function (_, m) { sys.puts(m); };

conn.connect(jid, password, function (status, condition) {
        if(status == xmpp.Status.CONNECTED)
                conn.addHandler(onMessage, null, 'message', null, null,  null);
        else
                conn.log(xmpp.LogLevel.DEBUG, "New connection status: " + status + (condition?(" ("+condition+")"):""));
});

function onMessage(message) {

        var line = message.getChild("body").getText();
        var words = line.split(" ");
        
        
        if(words[0] == "server")
        {
        	
       createWebServer();
        conn.debug("Server created");
      
       
        }
        
        /*
         * Someone can address what they think are JIDs on the component such as
         * soccer@group.loadtest.lab.tssg.org. We need to pick that up and handle the communication
         * from there on in. I am thinking of passing this to another function and seeing if the message is
         * say a group message to be delivered or a join message or a leave message. Having the subsequent helper
         * messages abstracted facilitates this.
         */
        if(message.getAttribute("to").match("@")) 
        {
        	var index = message.getAttribute("to").indexOf("@");
        	var gName = message.getAttribute("to").substr(0,index);
        	conn.debug("Someone addressed a group directly");
        	addressable(gName, message.getAttribute("from"));
        	return;
        }
        
        /*
         * Check to see if only one argument was used and that it isn't list or help
         */
        
        if(words.length == 1 && words[0] != "list" && words[0] != "help")
        {
        	
        	error(message.getAttribute("from"));
        	 return;
        }
        
        /*
         * Check to see if too many arguments were used, not including add and remove which take 3.
         */
        
        if(words.length >= 3 && words[0] != "add" && words[0] != "remove")
        {
        	error(message.getAttribute("from"));
        	return;
        }
        
        /*
         * Join keyword. User wishes to join an existing group.
         * join <groupName> will add the JID of the sending client to the group.
         * If the group doesn't exist an error is sent back.
         */

        if(words[0] == "join" || words[0] == "leave")
        {
        	membership(words[1], message.getAttribute("from"), words[0]);
        
        }
        
        
        /*
         * Create keyword. User wishes to create a new  group.
         * create <groupName> will create a group of that name and add the JID of the client who requested the 
         * creation to the group.
         * If the group exists already an error is sent back.
         */
        
        if(words[0] == "create")
        {
        	
        create(words[1], message.getAttribute("from"));
        
      
       
        }
        /*
         * Add keyword. User wishes to add another user to an existing group.
         * add <JID> <groupName> will add the JID to the existing group.
         * If the group doesn't exist an error is sent back. IF the user is already a member an error is sent back
         * TODO: Maybe an additional check is required to see if the person adding is actually a member of the group
         * i.e. you can't add to a group you aren't a member of or don't have rights to.
         * 
         * TODO: Investigate bare JID as the addition is of a standard JID. My dumb arrays
         * do not recognise that the person is part of the group when they interact with it, as the person who is logged in
         * typically will have a resource extension. This is causing issues only with the leave request 
         * but might have to be sorted here at the point of entry.
         */
        
        if(words[0] == "add" || words == "populate")   // Would need a check for a correct JID and that they are in the group already
        {
        	
        	
        	
        	if(words.length > 3)
        	{ // one more sanity check
        		error(message.getAttribute("from"));
           	
        		return;
        	}

        	
        	populate(words[2], words[1], message.getAttribute("from"));
        	
       
      
        } // close add if
        
        /*
         * Remove keyword. User wishes to remove another user to an existing group.
         * remove <JID> <groupName> will remove the JID from the existing group.
         * If the group doesn't exist an error is sent back. IF the user is not a member an error is sent back
         * TODO: Maybe an additional check is required to see if the person adding is actually a member of the group
         * i.e. you can't remove from a group you aren't a member of or don't have rights to.
         * TODO: Implement remove method.
         */
        
        if(words[0] == "remove")  // Would need a check for a correct JID and that they arein the gorup already
        {
        	
        	/*
        	 * This is not being implemented due to ownership issues. An admin
        	 * role needs to be defined per group so leaving this out for now.
        	 */

        	 conn.debug("We received an addition request from" + message.getAttribute("from"));
             conn.debug("The admin wants to remove " + words[1] + " from the group " + words[2]);
             conn.send(xmpp.message({
                 to:message.getAttribute("from"),
                 from:message.getAttribute("to"),
                 type: "chat"})
                         .c("body").t("The user " + words[1] + " has been removed from the group " + words[2]));
        }
        
        /*
         * Returns some information for the user, typically helpful prompts.
         */

        if(words[0] == "help")
        {
        	
        	 conn.debug("We received a help request from" + message.getAttribute("from"));
             conn.send(xmpp.message({
                 to:message.getAttribute("from"),
                 from:message.getAttribute("to"),
                 type: "chat"})
                         .c("body").t("The following keywords are allowed join <groupName>," +
                         		"leave <groupName>, add <JID> <GroupName>, remove <JID> <GroupName> "));
        }
        
        /*
         * A simple helper method to publish group memberships.
         * TODO: Enhance the list method to list only the groups the user is a member of
         * e.g. list me (lists my groups + their members)
         * list all (lists all groups + their members)
         */
        
        if(words[0] == "list")
        {
        	
        conn.debug("We received a list request from" + message.getAttribute("from"));
      
        for (var i = 0; i < groups.length; i++)
        {
        	var temp = groups[i];
        	conn.send(xmpp.message({
                to:message.getAttribute("from"),
                from:message.getAttribute("to"),
                type: "chat"})
                        .c("body").t("Group Name: " + temp[0]));
        	
        	for(var j = 1; j <temp.length; j++) // start at 1 to eliminate the name held at [0]
        	{
        		conn.send(xmpp.message({
                    to:message.getAttribute("from"),
                    from:message.getAttribute("to"),
                    type: "chat"})
                            .c("body").t("Group Members for " + temp[0] + ": " + temp[j]));
        		
        	}
        }
        
        }
        
        
        return true;  // so it doesn't exit
      
}

/*
 * Check to see if we know that group. Group names will always be in element 0.
 */

function checkForGroup(name)
{

for (var i = 0; i < groups.length; i++)
{
	var gname = groups[i];
	conn.debug("NAME IS " + gname[0]);
	if(gname[0] == name)
	{
	 return i;	
	}
	
}

return -1;

}

/*
 * Check to see if a certain person is a member of a certain group.
 */

function checkForMembership(g, name)
{
	
	for (var i = 1; i < g.length; i++)  // starts at 1 due to group name being [0]
	{
		
		if(g[i] == name)
		{
		 return true;	
		}
		
	}
	
	return false;
	
}

function addressable(group, destination)
{
	
	conn.debug("Someone wants to do something to our group, let's find out what");
	
	/*
	 * TODO Finish the logic, for now just testing it.
	 */
	conn.send(xmpp.message({
	    to:destination,
	    from:component_id,
	    type: "chat"})
	            .c("body").t("You wanted to talk to a specifc group called " + group + " functionality to be implemented soon."));
	
}

function error(destination)
{
conn.debug("Too few arguments, sending instructions");
conn.send(xmpp.message({
    to:destination,
    from:component_id,
    type: "chat"})
            .c("body").t("Unknown Arguments, format is <keyword> <groupName> such as join test" +
            		" or leave test. Type help to see a full list of keywords"));

}

function membership(group, destination, instruction)
{
	
	conn.debug("We got a " + instruction + " request from " + destination);
    conn.debug("The group he wants to " + instruction + " is " + group);
    
    
    	var position = checkForGroup(group);  // check for array position
    
    	conn.debug(position + " Was returned for " + group);
    	

    
    	if(position == -1)
    	{
    		  conn.send(xmpp.message({
    	            to:destination,
    	            from:component_id,
    	            type: "chat"})
    	                    .c("body").t("Request received to " + instruction + " " + group + " has been denied as this group does not exist"));
    		  return;
    		
    	}
    	
    	var temp = groups[position];
    	
    	if(instruction == "join")
    	{
    		if(checkForMembership(temp, destination)) // if true we deny him entry as he already is a member
    		{
    			 conn.send(xmpp.message({
    			        to:destination,
    			        from:component_id,
    			        type: "chat"})
    			                .c("body").t("Request received to join " + group + " has been denied as you are already a member"));
    			 return;
    		}
    		
    		else
    		{
    			temp.push(destination);
        		
    		    conn.send(xmpp.message({
    		        to:destination,
    		        from:component_id,
    		        type: "chat"})
    		                .c("body").t("Request received to join " + group + " has been approved"));
    		    return;
    			
    		}
    		
    		
    	}
    	
    	
    	
    	
    	if(instruction == "leave")
    	{
    		var temp = groups[position];
    		
    		if(checkForMembership(temp, destination))  // checking to see if he is already a member.
    		{
    			
    			var index = temp.indexOf(destination);   
    			/*
    			 * Technically we should also check here if this is the last person in the group
    			 * if it is we should delete the group.
    			 */
    			temp.splice(index,1);
    			
    			conn.send(xmpp.message({
    	            to:destination,
    	            from:component_id,
    	            type: "chat"})
    	                    .c("body").t("Request received to " + instruction + " " + group + " has been approved"));
    			
    		}
    		
    		else
    		{
    			conn.send(xmpp.message({
    	            to:destination,
    	            from:component_id,
    	            type: "chat"})
    	                    .c("body").t("Request received to " + instruction + " " + group + " has been denied as you are not a member in the first place"));
    			
    		}
    		
    	}
    	
    	
    
	
}

function create(group, owner)
{
	
	  conn.debug("We received a create request from" + owner);
      conn.debug("The group the user wants to create is " + group);
      
      var position = checkForGroup(group);
      if(position == -1)
      {
      	conn.debug("We don't have that group let's add it");
      	var newGroup = new Array(group, owner);
      	groups.push(newGroup);
      	 conn.send(xmpp.message({
               to:owner,
               from:component_id,
               type: "chat"})
                       .c("body").t("The group called " + group + " has been created"));
      }
      
      else
      {
      	conn.send(xmpp.message({
      		to:owner,
            from:component_id,
              type: "chat"})
                      .c("body").t("The group called " + group + " already exists, not creating it"));
      	
      }	
	
}


function populate(group, JID, originator)
{
	 conn.debug("We received an addition request from" + originator);
     conn.debug("The admin wants to add " + JID+ " to the group " + group);
     
     var position = checkForGroup(group);
     
     if(position == -1)
     {
     	 conn.send(xmpp.message({
              to:originator,
              from:component_id,
              type: "chat"})
                      .c("body").t("The group " + group + " does not exist"));
     }
     
     else
     {
      var g = groups[position];
      var test = checkForMembership(g,JID);
      
      if(test)
      {
     	 conn.send(xmpp.message({
     		 to:originator,
             from:component_id,
              type: "chat"})
                      .c("body").t("The user " + words[1] + " is already in the group " + words[2]));
      }
      
      else
      {
     	 g.push(JID); // addition made
     	  conn.send(xmpp.message({
     		 to:originator,
             from:component_id,
               type: "chat"})
                       .c("body").t("The user " + JID + " has been added to the group " + group));
     	  
     	  /*
     	   * Might be an idea to inform someone of their new membership...
     	   */
     	  
     	 conn.send(xmpp.message({
     		 to:JID,
             from:component_id,
               type: "chat"})
                       .c("body").t("The user " + originator + " has added you to the group " + group));
      }
     	
     }
     
}


function createWebServer()
{
	var http = require('http');
	
  

	var server = http.createServer(function(request, response) {
	console.log('new request');
	response.writeHead(200, {
	'Content-Type': 'text/plain'});
	response.write("Group Listings:\n")
	  for (var i = 0; i < groups.length; i++)
	    {
	    	var temp = groups[i];
	    	response.write("\nGroup Name: " + temp[0] + "\n")
	    	for(var j = 1; j <temp.length; j++) // start at 1 to eliminate the name held at [0]
	    	{
	    		response.write(temp[j] + "\n");
	    		
	    	}
	    }
	response.end("\nEnd Group Listing, try adding people and refreshing");

	});
	server.listen(4000);
	
	

}






