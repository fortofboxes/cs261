const udp = require('dgram');
const EventEmitter = require('events').EventEmitter;
const netConstants = require('./netConstants');

module.exports = class TransportLayer extends EventEmitter {
    constructor() {
        super();

        const _server = udp.createSocket('udp4');
        let _ready = false;

        this.listen = (port, callback) => {
            _server.on('listening', () => {
                _ready = true;
                this.emit('listening');
                process.nextTick(callback);
            });

            _server.bind({ port: port });
        };

        _server.on('message', (message, remote) => {
            this.emit('receive', message, remote.address, remote.port);
        });

        _server.on('error', (err) => {
            this.emit('error', err);
        });

        this.isReady = () => {
            return _ready;
        };

        this.send = (buffer, address, port, callback) => {
            _server.send(buffer, port, address, callback);
        };
    }
};

