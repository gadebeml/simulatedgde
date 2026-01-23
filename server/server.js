const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
var cors = require('cors');
//enable cors on the app
const app = express();

// Enable CORS for the client origin
app.use(cors({ origin: "*" }));



//app.use(cors());
//const app = express();
const PORT = 4055;
const { insidePolygon } = require('geolocation-utils');
app.use(express.json());
var bodyparser = require('body-parser');
var urlparser = bodyparser.urlencoded({extended: false});
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
//server.use(cors());
const io = socketIo(server);
//io.origins('*:*')

//io.origins('*:*');


io.on('connection', (socket) => {
    console.log('React client connected');
});



// Route to read CSV and return JSON
app.post('/fingerprinting',urlparser, async (req, res) => {
  //const results = [];
  const fileBuilding = path.join(__dirname, 'building.csv');
  const fileContact = path.join(__dirname, 'contacts.csv');
  const fileWebsite = path.join(__dirname, 'website.csv');
  try {
          //populate arrays with values from files
          const buildings = readLinesFromFile(fileBuilding);
          const contacts = readLinesFromFile(fileContact);
          const websites = readLinesFromFile(fileWebsite);
          //console.log("welcome", req.body);
          if (!req.body)
          {
            throw new Error(`Real time smartphone data not found, therefore not update will be effected`);
          }
          //Smartphone realtime observation
          const {id,bssid,location, callType,callduration,phoneNumber,ssid, website,visitDuration,refEmployee} = req.body.data[0];
              var rowFound = false;
              for (i in buildings)
                {
                    var block = buildings[i].split(";"); //Splits the building into three
                    // extrarct polygon array for geofence 
                    var polygon = extractCoordinates(block[1]);
		    //read GPS from phone
		    //console.log("GPS" + location);
                    // const gps = [28.092551, -25.655389] ; // [28.092561, -25.655392]; //[28.0878650, -25.6335088];   
                    var splitCoords = location.split(",");
                   //convert string to gps coordinates
                    const gps = [parseFloat(splitCoords[0]),parseFloat(splitCoords[1])]
		    console.log(gps);
		       if(determineGeofence(polygon,gps))
			 {
                             //collect value from phone ssid
                             const phoneSsid = ssid;  //"GDE_HR_Wifi";
	                     if (block[2].toLowerCase() === phoneSsid.toLowerCase())
				{
				    console.log ("within wi-fi");
	                            var phoneFound = false;
				    var websiteFound = false;

	                             for (j in contacts)
					{
					    var contactPhone = contacts[j].split(";");
						//validate whether the phone number is known within 
					    //var phoneNumber = "01133001";
					    if (phoneNumber === contactPhone[5])
					       {
						 phoneFound = true;
						 rowFound = true;
	                                       }
					}
				    //check whether the websites accessed is not or not
	                            for(w in websites)
	                            {
                                        var phoneWebsite = website; // "github.com";
                                        //var website =  websites[w]);
                                       //console.log(websites[w]);
	                                if (phoneWebsite === websites[w])
	                                {
	                                    websiteFound = true;
	                                    rowFound = true;
	                                }
	                            }
	                            if (phoneFound || websiteFound)
	                            {
	                               // timeseries.push(id + ","+bssid+ ","+location+ ","+ callType+ ","+callduration+ ","+phoneNumber+ ","+ssid+ ","+ website+ ","+visitDuration+ ","+refEmployee + "work related");
					 updateActivity(id, "Permissible Activity");

					console.log("phone or website found!!");
	                            }
	                            else
	                            {
	                               // timeseries.push( id + ","+bssid+ ","+location+ ","+ callType+ ","+callduration+ ","+phoneNumber+ ","+ssid+ ","+ website+ ","+visitDuration+ ","+refEmployee + "not work related");
					 updateActivity(id, "None Permissible Activity");
					//send notification to manager
					 notifyManager(refEmployee, phoneNumber,website,location,"None Permissible Activity");
                                         //notify Manager
					console.log("phone or website not found" + phoneNumber + " " + website);
	                            }
				}
                         }
                }

                if (!rowFound)
                 {
       		        //updateActivity(id, "None Permissible Activity, outside work premise!!");
 //send notification to manager
                        //notifyManager(refEmployee, phoneNumber,website,location,"None Permissible Activity outside work premise!!");
			console.log("Records is not found!!!");
                 }
		
			
		
     }
     catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

function determineGeofence(polygon,gps)
{
    console.log(polygon);
    const isInside = insidePolygon(gps, polygon);
    console.log(isInside);
    return isInside;

}

//Get records
function readLinesFromFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== ''); // Split by new line and filter out empty lines
    return lines;
  } catch (error) {
    console.error('Error reading file:', error);
    return []; // Return an empty array on error
  }
}
function extractCoordinates(str) {
  // Find all coordinate patterns in the string
  const coordinateRegex = /\[(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]/g;
  const matches = [];
  let match;
  
  while ((match = coordinateRegex.exec(str)) !== null) {
    matches.push([
      parseFloat(match[1]),
      parseFloat(match[2])
    ]);
  }
  
  return matches;
}
async function updateActivity(smartPhone, activity)
 {
    const updatePayload = {
    name: {
  	    type: "string",
	    value: activity
       }
     };
 // Update via Orion Context Broker
  //Update smartphone name activity
   const response = await fetch(`http://massive.meraka.csir.co.za:1026/v2/entities/${smartPhone}/attrs`, {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json',
        'Fiware-Service': 'iotgdesimulation',
        'Fiware-ServicePath': '/'
        },
        body: JSON.stringify(updatePayload)
      });

   if (!response.ok)
      {
         throw new Error(`Failed to update entity: ${smartPhone}`);
      }
}

async function getIdempiereAccess() 
{
 
  //Read existing department manager

    const res = await fetch(`https://massive.meraka.csir.co.za/api/v1/auth/tokens`,
      {
         method: 'POST',
         headers: {
                    
                  }
     });

     if (res.status != 200)
        {
          throw new Error(`Failed to read entity: ${refEmployee} is not found`);
        }
    const data = await res.json();
}
async function notifyManager(refEmployee, phoneStr, website,location,activityStr) 
{
 
  //Read existing department manager

    const res = await fetch(`http://massive.meraka.csir.co.za:1026/v2/entities/${refEmployee}`,
      {
         method: 'GET',
         headers: {
                    'Fiware-Service': 'iotgdesimulation',
                    'Fiware-ServicePath': '/'
                  }
     });

     if (res.status != 200)
        {
          throw new Error(`Failed to read entity: ${refEmployee} is not found`);
        }
    const data = await res.json();
	//from return data collect refDepartment, name, surname,email
    const{refDepartment,name,firstName} = data;
    if (refDepartment.value != NaN)
	{
	   //Get department details
	   const deptRes = await fetch(`http://massive.meraka.csir.co.za:1026/v2/entities/${refDepartment.value}`,
	      {
	         method: 'GET',
	         headers: {
	                    'Fiware-Service': 'iotgdesimulation',
	                    'Fiware-ServicePath': '/'
	                  }
	     });

	     if (deptRes.status != 200)
	        {
	          throw new Error(`Failed to read entity: ${refDepartment} is not found`);
	        }
	    const deptData = await deptRes.json();
      //collect department data
      const {manager, email, department} = deptData;
      const myNotification = {
	      department: department.value,
		    name : name.value + " " + firstName.value,
        phone : phoneStr,
		    web : website,
		    activity: activityStr,
		    gps: location,  
		    manager: manager.value,
		    managerEmail: email.value	
        };
	// Send the notification data to all connected React clients via Socket.IO
 	//console.log(myNotification);
        io.emit('fiware-update', myNotification);
       //res.status(204).send(); // Send a 204 No Content response as Orion doesn't need a response body
       
      }
   

}

io.on('connection', (socket) => {
    console.log('React client connected');
});

server.listen(PORT, () => {
  console.log(`Server running on massive:${PORT}`);
});
