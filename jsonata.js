/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function (RED) {
	"use strict";

	function JSONataNode(n) {
		RED.nodes.createNode(this, n);

		//Set node properties
		this.property = n.property || "payload"; //JSON string, user defined (default to payload)
		this.jsonata = n.jsonata || "jsonata"; //JSONata query from msg.jsonata
		this.jsonatauser = n.jsonatauser || undefined; //JSONata query from user
		this.jsonataResult = n.jsonataResult || "jsonataResult"; //Result returned, msg.jsonataResult

		var node = this;
		var jsonataOpts = "msg";

		//Set node input events for msg responses
		this.on("input", function (msg) {

			//Get input variable to query JSON
			var jsonStr = RED.util.getMessageProperty(msg, node.property);
			var jsonataStr = RED.util.getMessageProperty(msg, node.jsonata);

			//Remove previous result from msg if exists
			if (msg.jsonataResult !== undefined) {
				delete msg.jsonataResult;
			}

			//Give proirity to JSONata sent through the msg over the user defined
			if (jsonataStr === undefined && node.jsonatauser !== undefined && node.jsonatauser !== "") {
				jsonataStr = node.jsonatauser;
				jsonataOpts = "opts";
			}
			
            //Set the nodes visual status
			var showNodeStatus = function(msg,err){
				node.status({fill: (err?"red":"green"),shape: "dot",text: msg});
			};
            
            //Set the return status of the message
            var setMsgStatus = function(rmsg){
                RED.util.setMessageProperty(msg, "jsonataStatus",rmsg); 
            };

			//Confirm the inputs are valid before processing
			if (jsonStr !== undefined) {
				if (typeof jsonStr === "string") {
					if (jsonataStr !== undefined) {
						try {
							//Where the magic happens, parse JSON and envaluate against the JSONata.
							//Must prepare before envaluate, setting _expr in RED.util
							var expr = RED.util.prepareJSONataExpression(jsonataStr, node);
							var result = RED.util.evaluateJSONataExpression(expr, JSON.parse(jsonStr));

							if (result !== undefined) {
								//Success, return the result msg.result
								RED.util.setMessageProperty(msg, node.jsonataResult, result);
                                setMsgStatus("Success");
								showNodeStatus("success ("+jsonataOpts+")",false);
							} else {
								setMsgStatus("no JSONata result ("+jsonataOpts+")");
								showNodeStatus("no JSONata result ("+jsonataOpts+")",true);
							}
						} catch (e) {
							node.error(e.message, msg);
						}
					} else {
						setMsgStatus("No JSONata provided");
						showNodeStatus("JSONata missing",true);
					}
				} else {
					setMsgStatus("Invalid JSON string (" + jsonStr + ")");
					showNodeStatus("invalid JSON",true);
				}
			} else {
				setMsgStatus("No JSON string provided (" + node.property + ")");
				showNodeStatus("JSON missing",true);
			}

			//Send the msg object with or without the return result
			node.send(msg);
		});
	}
	RED.nodes.registerType("jsonata", JSONataNode);
}