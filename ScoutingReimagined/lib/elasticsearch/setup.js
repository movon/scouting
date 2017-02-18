var schemasDir = __dirname + "/../../schemas"

function setup() {
    var client = require('./connection');
    indexGames(client);
    indexEvents(client);
}

/**
 * Indexes 'events' and uses @function mapEvents to map all event types
 * @param  {ElasticsearchConnection} client connection to the elasticsearch instance
 */
function indexEvents(client) {
    client.indices.exists({
        index: 'events'
    }, function (err, exists) {
        if (!exists) {
            client.indices.create({
                index: 'events'
            }, function (err, res) {
                console.log("err", err);
                console.log("res", res);
                if (!err) {
                    // Push mappings
                    mapEvents(client);
                }
            });
        } else {
            mapEvents(client);
        }
    });
}

/**
 * Indexes 'games' and uses @function mapGames to map the type game
 * @param  {ElasticsearchConnection} client connection to the elasticsearch instance
 */
function indexGames(client) {
    client.indices.exists({
        index: 'games'
    }, function (err, exists) {
        if (!exists) {
            client.indices.create({
                index: 'games'
            }, function (err, res) {
                console.log("err", err);
                console.log("res", res);
                if (!err) {
                    // Push mappings
                    mapGames(client);
                }
            });
        } else {
            mapGames(client);
        }

    });
}

/**
 * Maps the type game to the index games using schema defined in @file schemas/games.js
 * @param  {ElasticsearchConnection} client connection to the elasticsearch instance
 * @return {[type]}        [description]
 */
function mapGames(client) {
    var game = require(schemasDir + '/game');
    client.indices.putMapping({
        index: "games",
        type: "game",
        body: game
    }, function (err, res) {
        console.log("err: ", err);
        console.log("res: ", res);
    });
}

/**
 * Maps every event type (defined in @file schemas/events/*.js) in the index events
 * @param  {ElasticsearchConnection} client connection to the elasticsearch instance
 */
function mapEvents(client) {
    //	TODO: Check if inserting the require expression inside typeToMapping is possible
    var ballPickup = require(schemasDir + '/events/ballPickup');
    var climb = require(schemasDir + '/events/climb');
    var disabled = require(schemasDir + '/events/disabled');
    var fight = require(schemasDir + '/events/fight');
    var gearPickup = require(schemasDir + '/events/gearPickup');
    var gearPlace = require(schemasDir + '/events/gearPlace');
    var shooting = require(schemasDir + '/events/shooting');

    /**
     * Maps the type name to it's mapping
     * @type {Dictionary}
     */
    var typeToMapping = {
        "ballPickup": ballPickup,
        "climb": climb,
        "disabled": disabled,
        "fight": fight,
        "gearPickup": gearPickup,
        "gearPlace": gearPlace,
        "shooting": shooting
    };

    for (var type in typeToMapping) {
        client.indices.putMapping({
            index: "events",
            type: type,
            body: typeToMapping[type]
        }, function (err, res) {
            console.log("err: ", err);
            console.log("res: ", res);
        });
    }
}

module.exports = {
    setup: setup
};