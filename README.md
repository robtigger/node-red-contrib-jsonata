node-red-contrib-tgr-jsonata
=====================

Node-RED node for JSONata
Dynamically set the JSONata query and run over a JSON string returning the result within the message.

Install
-------
Run the following command in your Node-RED user directory - typically `~/.node-red`

        npm install node-red-contrib-tgr-jsonata

Message Inputs
----------
- **msg.payload** (default) = JSON string to be queried. This can be change within the node options
- **msg.jsonata** = JSONata query to be used.

Message Outputs
----------
- **msg.jsonataResult** (String) = The result returned. Only returned if the JSONata query is successful otherwise will be undefined.
- **msg.jsonataStatus** (String) = The status message, success or errored returned.
- **msg.jsonataByMsg** (Boolean) = The message (msg.jsonata) JSONata query was used, returning true. False, if the node options (JSONata Query) was utlised. Only defined when a result (msg.jsonataResult) is returned.

Message Status
----------
The status returned either on the message (msg.jsonataStatus) or displayed below the node when executed.

- **Success**, Successful query and the msg.jsonataResult with have the result.
- **No JSONata result**, The JSONata query provided no result when queried.
- **No JSONata provided**, The JSONata query is missing from the message (msg.jsonata) or not set in the node options (JSONata Query).
- **Invalid JSON string**, JSON string provided is invalid or malformed.
- **No JSON string provided**, JSON string is missing from the message (msg.payload, default).

Note
----------
When JSONata is set within the message (msg.jsonata) and the node options (JSONata Query) the message (msg.jsonata) has priority, the JSONata query in the node options will be ignored. Allowing a static JSONata query to be set and dynamically changed as required.

Author
----------
Rob Goodsell

Copyright and license
----------
Copyright 2018 Rob Goodsell under the Apache 2.0 license.