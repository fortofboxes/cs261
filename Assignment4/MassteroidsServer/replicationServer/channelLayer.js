const netPayloadSerializer = require('./netPayloadSerializer');
const EventEmitter = require('events').EventEmitter;
const netConstants = require('./netConstants');

function testBit(dest, value, key) {
    if (value > dest["highest" + key])
        return false;

    if (value == dest["highest" + key])
        return true;

    let offset = (dest["highest" + key] - value) - 1;
    if (offset > 31)
        return true;        // We don't know, but we'll have to assume...

    return (dest["previous" + key] >>> (31 - offset)) & 0x01;
}

function updateBit(dest, value, key) {
    if (value > dest["highest" + key]) {
        let offset = value - dest["highest" + key];
        if (offset > 31) {
            dest["highest" + key] = value;
            dest["previous" + key] = 0;
        }
        else {
            let oldHighest = dest["highest" + key];
            dest["highest" + key] = value;
            dest["previous" + key] = dest["previous" + key] >>> offset;

            updateBit(dest, oldHighest, key);
        }
    } else if (value < dest["highest" + key]) {
        let offset = (dest["highest" + key] - value) - 1;
        if (offset > 31)
            return;        // Nothing we can really do here...

        let mask = 1 << (31 - offset);
        dest["previous" + key] = (dest["previous" + key] | mask) >>> 0;
    } else {
        // seq == this.highestAcked means there's nothing to do!
    }
}

class Client {
    constructor(id, payload, address, port) {
        this.id = id;
        this.protocol = payload.protocol;
        this.address = address;
        this.port = port;
        this.state = netConstants.stateEnum.disconnected;
        this.seq = 1;
        this.highestReceived = payload.seq;
        this.previousReceived = 0;
        this.highestAcked = payload.ack;
        this.previousAcked = payload.pastAcks;

        this.hasAcked = (seq) => {
            return testBit(this, seq, "Acked");
        };
        this.markAcked = (seq) => {
            updateBit(this, seq, "Acked");
        };

        this.hasReceived = (seq) => {
            return testBit(this, seq, "Received");
        };
        this.markReceived = (seq) => {
            updateBit(this, seq, "Received");
        }

        this.createBuffer = (extraBytes) => {
            let size = netPayloadSerializer.getRequiredCapacity();
            let dataSize = 0;
            if (extraBytes && extraBytes.length > 0)
                dataSize = extraBytes.length;

            let buffer = Buffer.allocUnsafe(size + dataSize);
            buffer.fill(0, size);
            if (dataSize > 0) {
                extraBytes.copy(buffer, size, 0, dataSize);
            }

            netPayloadSerializer.serialize(buffer, {
                client: this.id,
                protocol: netConstants.currentProtocol,
                state: this.state,
                reserved: 0,
                seq: this.seq,
                ack: this.highestReceived,
                pastAcks: this.previousReceived
            });

            return buffer;
        };
    }
}

module.exports = class ChannelLayer extends EventEmitter {
    constructor(transport) {
        super();

        const _transport = transport;
        let _ready = false;

        let _clients = [ ];
        let _clientIdForSocket = { };
        let _nextClientId = 100;

        this.isReady = () => {
            return _ready;
        };

        this.setupNewClient = (payload, address, port) => {
            let client = new Client(_nextClientId, payload, address, port);
            ++_nextClientId;

            _clients[client.id] = client;
            let key = address + ':' + port;
            _clientIdForSocket[key] = client.id;

            client.send = (data) => {
                let dataSize = 0;
                if (data)
                    dataSize = data.length;

                let buffer = client.createBuffer(data);
                _transport.send(buffer, address, port, (err) => {
                    if (err) {
                        console.log('Could not send to %s:%d : %s\n%s\n',
                            address, port, err, JSON.stringify(client));
                    }
                    else {
                        client.seq += 1;
                    }
                });
            };

            return client;
        };

        this.clientForSocket = (address, port) => {
            let key = address + ':' + port;
            return _clients[_clientIdForSocket[key]];
        };

        this.handlePayload = (payload, data, address, port) => {
            let client = _clients[payload.client];
            let existing = true;
            if (!client) {
                client = this.clientForSocket(address, port);
                if (!client) {
                    client = this.setupNewClient(payload, address, port);
                    existing = false;
                }
            }

            if (existing) {
                client.markReceived(payload.seq);
            }

            if (client.state != netConstants.stateEnum.playing) {
                // If we're not playing, then it's our responsibility to ack the packet
                client.send(null);
            }

            this.emit('receive', client, data);
        };

        _transport.on('listening', () => {
            _ready = true;
            this.emit('listening');
            console.log("Channel layer says transport layer is listening");
        });

        _transport.on('receive', (buffer, address, port) => {
            if (buffer.length >= netPayloadSerializer.getRequiredCapacity()) {
                let payload = {};
                let offset = netPayloadSerializer.deserialize(buffer, payload);
                let data = null;

                if (offset > 0)
                    data = buffer.slice(offset);

                this.handlePayload(payload, data, address, port);
            }
            else {
                console.log('Discarding invalid packet of %d bytes from %s:%d : %s\n',
                    buffer.length, address, port, buffer.toString('hex'));
            }
        });
    };
}
