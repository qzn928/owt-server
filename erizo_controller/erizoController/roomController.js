/*global require, exports, console, setInterval, clearInterval*/

var addon = require('./../../erizoAPI/build/Release/addon');
var config = require('./../../licode_config');
var logger = require('./../common/logger').logger;

exports.RoomController = function (spec) {
    "use strict";

    var that = {},
        // {id: array of subscribers}
        subscribers = {},
        // {id: OneToManyProcessor}
        publishers = {},

        // {id: ExternalOutput}
        externalOutputs = {};

    var rpc = spec.rpc;

    var createErizoJS = function(publisher_id, callback) {
    	rpc.callRpc("ErizoAgent", "createErizoJS", [publisher_id], {callback: callback});
    };


    that.addExternalInput = function (publisher_id, url, callback) {

        if (publishers[publisher_id] === undefined) {

            logger.info("Adding external input peer_id ", publisher_id);

            // then we call its addPublisher method.
	        var args = [publisher_id, url];
	        rpc.callRpc("ErizoJS_" + publisher_id, "addExternalInput", args, {callback: callback});

	        // Track publisher locally
            publishers[publisher_id] = publisher_id;
            subscribers[publisher_id] = [];

        } else {
            logger.info("Publisher already set for", publisher_id);
        }
    };

    that.addExternalOutput = function (publisher_id, url) {
        if (publishers[publisher_id] !== undefined) {
            logger.info("Adding ExternalOutput to " + publisher_id + " url " + url);

            var args = [publisher_id, url];

            rpc.callRpc("ErizoJS_" + publisher_id, "addExternalOutput", args, undefined);

            // Track external outputs
            externalOutputs[url] = externalOutput;
        }

    };

    that.removeExternalOutput = function (publisher_id, url) {
      if (externalOutputs[url] !== undefined && publishers[publisher_id]!=undefined) {
        logger.info("Stopping ExternalOutput: url " + url);

        var args = [publisher_id, url];
        rpc.callRpc("ErizoJS_" + publisher_id, "removeExternalOutput", args, undefined);

        // Remove track
        delete externalOutputs[url];
      }
    };

    /*
     * Adds a publisher to the room. This creates a new OneToManyProcessor
     * and a new WebRtcConnection. This WebRtcConnection will be the publisher
     * of the OneToManyProcessor.
     */
    that.addPublisher = function (publisher_id, sdp, callback, onReady) {

        if (publishers[publisher_id] === undefined) {

            logger.info("Adding publisher peer_id ", publisher_id);

            // We create a new ErizoJS with the publisher_id.
            createErizoJS(publisher_id, function() {
            	console.log("Erizo created");
            	// then we call its addPublisher method.
	            var args = [publisher_id, sdp];
	            rpc.callRpc("ErizoJS_" + publisher_id, "addPublisher", args, {callback: callback, onReady: onReady});

	            // Track publisher locally
	            publishers[publisher_id] = publisher_id;
	            subscribers[publisher_id] = [];
            });

        } else {
            logger.info("Publisher already set for", publisher_id);
        }
    };

    /*
     * Adds a subscriber to the room. This creates a new WebRtcConnection.
     * This WebRtcConnection will be added to the subscribers list of the
     * OneToManyProcessor.
     */
    that.addSubscriber = function (subscriber_id, publisher_id, audio, video, sdp, callback, onReady) {

        if (publishers[publisher_id] !== undefined && subscribers[publisher_id].indexOf(subscriber_id) === -1 && sdp.match('OFFER') !== null) {

            logger.info("Adding subscriber ", subscriber_id, ' to publisher ', publisher_id);

            var args = [subscriber_id, publisher_id, audio, video, sdp];

            rpc.callRpc("ErizoJS_" + publisher_id, "addSubscriber", args, {callback: callback, onReady: onReady});

            // Track subscriber locally
            subscribers[publisher_id].push(subscriber_id);
        }
    };

    /*
     * Removes a publisher from the room. This also deletes the associated OneToManyProcessor.
     */
    that.removePublisher = function (publisher_id) {

        if (subscribers[publisher_id] !== undefined && publishers[publisher_id] !== undefined) {
            logger.info('Removing muxer', publisher_id);

            var args = [publisher_id];
            rpc.callRpc("ErizoJS_" + publisher_id, "removePublisher", args, undefined);

            // Remove tracks
            logger.info('Removing subscribers', publisher_id);
            delete subscribers[publisher_id];
            logger.info('Removing publisher', publisher_id);
            delete publishers[publisher_id];
            logger.info('Removed all');
        }
    };

    /*
     * Removes a subscriber from the room. This also removes it from the associated OneToManyProcessor.
     */
    that.removeSubscriber = function (subscriber_id, publisher_id) {

        var index = subscribers[publisher_id].indexOf(subscriber_id);
        if (index !== -1) {
            logger.info('Removing subscriber ', subscriber_id, 'to muxer ', publisher_id);

            var args = [subscriber_id, publisher_id];
            rpc.callRpc("ErizoJS_" + publisher_id, "removeSubscriber", args, undefined);

            // Remove track
            subscribers[publisher_id].splice(index, 1);
        }
    };

    /*
     * Removes all the subscribers related with a client.
     */
    that.removeSubscriptions = function (subscriber_id) {

        var publisher_id, index;

        logger.info('Removing subscriptions of ', subscriber_id);


        for (publisher_id in subscribers) {
            if (subscribers.hasOwnProperty(publisher_id)) {
                index = subscribers[publisher_id].indexOf(subscriber_id);
                if (index !== -1) {
                    logger.info('Removing subscriber ', subscriber_id, 'to muxer ', publisher_id);

                    var args = [subscriber_id, publisher_id];
            		rpc.callRpc("ErizoJS_" + publisher_id, "removeSubscriber", args, undefined);

            		// Remove tracks
                    subscribers[publisher_id].splice(index, 1);
                }
            }
        }
    };

    return that;
};
