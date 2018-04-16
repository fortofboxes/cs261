const EventEmitter = require('events').EventEmitter;
const netConstants = require('./netConstants');

module.exports = class ReplicationLayer extends EventEmitter {
    constructor(channel) {
        super();

        const _channel = channel;

        let _players = [ ];

        let _ready = false;

        this.isReady = () => {
            return _ready;
        };

        _channel.on('listening', () => {
            _ready = true;
            console.log("Replication layer says channel layer is listening");
        });

        _channel.on('receive', (client, data) => {
            // In future assignments, map client to player ID (after player has logged in)
            let player = {
                id: 1,
                client: client
            };
            _players = [ player ];

            this.emit('received', player, data);
        });

        this.broadcast = (buffer) => {
            for (let i = 0; i < _players.length; i++) {
                _players[i].client.send(buffer);
            }
        };
    };
}
