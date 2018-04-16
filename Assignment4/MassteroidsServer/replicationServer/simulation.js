var shipPosX = 0.0;
var shipPosY = 0.0;
var shipRotZ = 0.0;
var time     = 0.0;
var rotRight = false;
var rotLeft  = false;
var thrust   = false;
var shipRotationSpeed = 20.0;
var shipMovementSpeed = 20.0;

exports.GetShipPosX =() => {
	return shipPosX;
}
exports.GetShipPosY =() => {
	return shipPosY;
}
exports.GetShipRotZ =() => {
	return shipRotZ;
}
exports.GetTime =() => {
	return time;
}
exports.begin = () => {
    // TODO initialize simulation : done
	shipPosX = 0.0;
	shipPosY = 0.0;
	shipRotZ = 0.0;
	time     = 0.0;
};

exports.acceptInput = (player, input) => {
    // TODO capture player input but don't apply it yet
	thrust   = input[0];
	rotRight = input[1];
	rotLeft  = input[2];
};

exports.calculateFrame = (elapsed) => {
    // TODO update simulation
    time += (elapsed * 0.001);
    // TODO return frame
    if (rotRight){
    	shipRotZ += shipRotationSpeed;
    }
    if (rotLeft){
    	shipRotZ -= shipRotationSpeed;
    }
    if (thrust){
    	var radians = shipRotZ * (Math.PI / 180);
    	shipPosX += Math.cos(radians) * shipMovementSpeed;
    	shipPosY += Math.sin(radians) * shipMovementSpeed;    	
    }
};
