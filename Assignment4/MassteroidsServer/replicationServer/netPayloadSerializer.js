module.exports.deserialize = (buffer, dest, offset) => {
    let index = 0;
    if (offset)
        index += offset;

    if ((buffer.length - index) < 12)
        return (buffer.length - index) - 12;

    dest.client = buffer.readUInt16LE(index, true);
    index += 2;

    dest.protocol = buffer.readUInt8(index, true);
    index += 1;

    let temp = buffer.readUInt8(index, true);
    index += 1;
    dest.reserved = temp >>> 4;
    dest.state = temp & 0x0F;

    dest.seq = buffer.readUInt16LE(index, true);
    index += 2;

    dest.ack = buffer.readUInt16LE(index, true);
    index += 2;

    dest.pastAcks = buffer.readUInt32LE(index, true);
    index += 4;

    return index;
};

module.exports.makeDeserializer = (dest) => {
    return (buffer) => {
        return module.exports.deserialize(buffer, dest);
    };
};

module.exports.serialize = (buffer, src, offset) => {
    let index = 0;
    if (offset)
        index += offset;

    if (buffer.length < (index + 12))
        return (buffer.length - (index + 12));

    buffer.writeUInt16LE(src.client, index, true);
    index += 2;

    buffer.writeUInt8(src.protocol, index, true);
    index += 1;

    let temp = src.reserved << 4;
    temp |= (src.state & 0x0F);
    buffer.writeUInt8(temp, index, true);
    index += 1;

    buffer.writeUInt16LE(src.seq, index, true);
    index += 2;

    buffer.writeUInt16LE(src.ack, index, true);
    index += 2;

    buffer.writeUInt32LE(src.pastAcks, index, true);
    index += 4;

    return index;
};

module.exports.makeSerializer = (src) => {
    return (buffer) => {
        return module.exports.serialize(buffer, src);
    };
};

module.exports.getRequiredCapacity = () => {
    return 12;
};