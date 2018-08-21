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
module.exports = function(RED) {
	"use strict";

	function JSONataNode(n) {
		RED.nodes.createNode(this, n);

		var node = this;
		var jsonataCalcMsg = true; //Message used to determine result, message = true, options = false.

		//Set node properties
		this.property = n.property || "payload"; //JSON string, user defined (default to payload)
		this.jsonata = n.jsonata || "jsonata"; //JSONata query from msg.jsonata
		this.jsonataOpts = n.jsonataOpts || undefined; //JSONata query from user
		this.jsonataResult = "jsonataResult"; //Result returned, msg.jsonataResult
		this.jsonataByMsg = "jsonataByMsg"; //JSONata calculated using msg, msg.jsonataByMsg

		//Set node input events for msg events
		this.on("input", function(msg) {
			try {
				//Get input variable to query JSON
				var jsonStr = RED.util.getMessageProperty(msg, node.property);
				var jsonataStr = RED.util.getMessageProperty(msg, node.jsonata);

				//Check strings for undefined and empty state
				var isNullOrEmpty = function(str) {
					return !(typeof str === "string" && str.length > 0);
				};

				//Set the nodes visual status
				var showNodeStatus = function(msg, err) {
					if (!isNullOrEmpty(msg) && typeof err === "boolean") {
						node.status({
							fill: (err ? "red" : "green"),
							shape: "dot",
							text: msg
						});
					}
				};

				//Set the return status of the message
				var setMsgStatus = function(rmsg) {
					if (!isNullOrEmpty(rmsg) && isNullOrEmpty(msg)) {
						RED.util.setMessageProperty(msg, "jsonataStatus", rmsg);
					}
				};

				//Remove previous result from msg if exists
				if (!isNullOrEmpty(msg.jsonataResult)) {
					delete msg.jsonataResult;
				}

				//Give proirity to JSONata sent through the msg over the user defined
				if (typeof jsonataStr === 'undefined' && !isNullOrEmpty(node.jsonataOpts)) {
					jsonataStr = node.jsonataOpts;
					jsonataCalcMsg = false;
				}

				//Confirm the inputs are valid before processing
				if (typeof jsonStr !== 'undefined' && jsonStr !== "") {
					if (typeof jsonStr === "string") {
						if (!isNullOrEmpty(jsonataStr)) {
							try {
								//Where the magic happens, parse JSON and envaluate against the JSONata.
								//Must prepare before envaluate, setting _expr in RED.util
								var expr = RED.util.prepareJSONataExpression(jsonataStr, node);
								var result = RED.util.evaluateJSONataExpression(expr, JSON.parse(jsonStr));

								if (typeof result !== 'undefined') {
									//Success, return the result msg.result
									RED.util.setMessageProperty(msg, node.jsonataResult, result);
									RED.util.setMessageProperty(msg, node.jsonataByMsg, jsonataCalcMsg);
									setMsgStatus("Success");
									showNodeStatus("success (" + (jsonataCalcMsg ? "msg" : "opts") + ")", false);
								} else {
									//JSONata envaluate returned no result. Return status of no result
									setMsgStatus("no JSONata result (" + (jsonataCalcMsg ? "msg" : "opts") + ")");
									showNodeStatus("no JSONata result (" + (jsonataCalcMsg ? "msg" : "opts") + ")", true);
								}
							} catch (e) {
								node.error("Inner Exception: " + e.message, msg);
							}
						} else {
							//jsonata missing from the message (msg)
							setMsgStatus("No JSONata provided");
							showNodeStatus("JSONata missing", true);
						}
					} else {
						//jsonata object must be of the type string
						setMsgStatus("Invalid JSON string (" + jsonStr + ")");
						showNodeStatus("JSON invalid", true);
					}
				} else {
					//JSON missing as defined by options, default is msg.payload
					setMsgStatus("No JSON string provided (" + node.property + ")");
					showNodeStatus("JSON missing", true);
				}
			} catch (e) {
				node.error("Outer Exception: " + e.message, msg);
			}

			//Send the msg object with or without the JSONata result
			node.send(msg);
		});
	}
	RED.nodes.registerType("jsonata", JSONataNode);
}