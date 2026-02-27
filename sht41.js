module.exports = function(RED) {

    const i2c = require('i2c-bus');

    function SHT41Node(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.busNumber = parseInt(config.busNum) || 1;
        node.address = parseInt(config.address) || 0x44;
        node.precision = config.precision || "high";
        node.unit = config.unit || "F";       // C or F

        const COMMANDS = {
            high: 0xFD,
            medium: 0xF6,
            low: 0xE0
        };

        let bus;

        try {
            bus = i2c.openSync(node.busNumber);
            node.status({fill:"green",shape:"dot",text:"I2C Ready"});
        } catch (err) {
            node.status({fill:"red",shape:"ring",text:"I2C Error"});
            node.error("Failed to open I2C bus: " + err.message);
            return;
        }

        // CRC-8 check (polynomial 0x31)
        function checkCRC(data, crc) {
            let calculated = 0xFF;
            for (let i = 0; i < 2; i++) {
                calculated ^= data[i];
                for (let bit = 8; bit > 0; --bit) {
                    if (calculated & 0x80) {
                        calculated = (calculated << 1) ^ 0x31;
                    } else {
                        calculated <<= 1;
                    }
                }
            }
            calculated &= 0xFF;
            return calculated === crc;
        }

        node.on('input', function(msg) {

            const command = COMMANDS[node.precision] || 0xFD;

            try {
                const cmdBuffer = Buffer.from([command]);
                bus.i2cWriteSync(node.address, 1, cmdBuffer);
            } catch (err) {
				if (err.code === 'ENOENT' && err.message.includes('/dev/i2c-1')) {
					node.status({fill:"red",shape:"ring",text:"I2C Disabled"});
					node.error("I2C bus '/dev/i2c-1' not found. Enable I2C in Raspberry Pi configuration.", msg);
				} else {
					node.status({fill:"red",shape:"ring",text:"Write Error"});
					node.error("Write Error: " + err.message, msg);
				}
				return;
			}

            setTimeout(() => {
                try {
                    const buf = Buffer.alloc(6);
                    bus.i2cReadSync(node.address, 6, buf);

                    // CRC validation
                    if (!checkCRC([buf[0], buf[1]], buf[2]) ||
                        !checkCRC([buf[3], buf[4]], buf[5])) {

                        node.status({fill:"yellow",shape:"ring",text:"CRC Fail"});
                        node.error("CRC Validation Failed", msg);
                        return;
                    }

                    const rawT = (buf[0] << 8) | buf[1];
                    const rawRH = (buf[3] << 8) | buf[4];

                    let temperature = -45 + 175 * (rawT / 65535);
                    const humidity = -6 + 125 * (rawRH / 65535);

                    if (node.unit === "F") {
                        temperature = (temperature * 9/5) + 32;
                    }

                    msg.payload = {
                        temperature: parseFloat(temperature.toFixed(2)),
                        humidity: parseFloat(humidity.toFixed(2)),
                        unit: node.unit
                    };

                    node.status({fill:"green",shape:"dot",text:"T: " + msg.payload.temperature + ", H: " + msg.payload.humidity});
                    node.send(msg);

                } catch (err) {
					if (err.code === 'ENOENT' && err.message.includes('/dev/i2c-1')) {
						node.status({fill:"red",shape:"ring",text:"I2C Disabled"});
						node.error("I2C bus '/dev/i2c-1' not found. Enable I2C in Raspberry Pi configuration.", msg);
					} else {
						node.status({fill:"red",shape:"ring",text:"Read Error"});
						node.error("Read Error: " + err.message, msg);
					}
                }

            }, 15);
        });

        node.on('close', function() {
            if (bus) {
                try {
                    bus.closeSync();
                } catch (err) {}
            }
        });
    }

    RED.nodes.registerType("SHT41", SHT41Node);
}