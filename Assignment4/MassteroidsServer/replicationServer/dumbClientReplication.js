const TransportLayer = require('./transportLayer');
const ChannelLayer = require('./channelLayer');
const ReplicationLayer = require('./replicationLayer');
const netConstants = require('./netConstants');

const TheSimulation = require('./simulation');

function getTick() {
    let hrtime = process.hrtime();
    return (hrtime[0] * 1000) + (hrtime[1] / 1000000);
}

exports.listen = (port, callback) => {
    const _transport = new TransportLayer();
    const _channel = new ChannelLayer(_transport);
    const _replication = new ReplicationLayer(_channel);

    let _lastTime = getTick();
    TheSimulation.begin();

    setInterval(() => {
        let now = getTick();
        let elapsed = now - _lastTime;
        let frame = TheSimulation.calculateFrame(elapsed);
        // TODO allocate buffer big enough for simulation frame : DONE
         
        let buffer = Buffer.allocUnsafe(16); // Depends on frame size : 16 for now 
        // TODO serialize frame into buffer : DONE
        buffer.writeFloatLE(TheSimulation.GetShipPosX(), 0);
        buffer.writeFloatLE(TheSimulation.GetShipPosY(), 4);
        buffer.writeFloatLE(TheSimulation.GetShipRotZ(), 8);
        buffer.writeFloatLE(TheSimulation.GetTime(), 12);

        _replication.broadcast(buffer);

        _lastTime = now;
    }, 1000 * netConstants.simulationRate);

    _replication.on('received', (player, data) => {
        // TODO: Parse received data to get player input From client?
        //let playerInput = { };

        TheSimulation.acceptInput(player, data);
    });

    _transport.listen(port, callback);
};

