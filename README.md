# @wigglywire/node-red-sht4x
A Node-RED node for interfacing with the Sensirion SHT41 temperature and humidity sensor over I²C. This node reads temperature and relative humidity from an SHT41 sensor when triggered by an input message. Temperature units are user-selectable between °C and °F.

## Features:
* I²C communication with SHT41
* Temperature output in:
  * Degrees Celsius (°C)
  * Degrees Fahrenheit (°F)
* Relative humidity output (%RH)
* Triggered by standard Node-RED input message
* Designed for Raspberry Pi and other Linux SBCs

## Installation:
## From Node-RED (Recommended):
1. Open Node-RED
2. Go to Menu → Manage Palette
3. Select the Install tab
4. Search for:

       @wigglywire/node-red-sht4x
5. Click Install

### From Command Line:

Run the following in your Node-RED user directory (typically `~/.node-red`):

    npm install @wigglywire/node-red-sht4x

Restart Node-RED.

## Hardware Requirements
* Sensirion SHT41 Temperature & Humidity Sensor
* I²C enabled system (e.g., Raspberry Pi)

**Enable I²C (Raspberry Pi)**

    sudo raspi-config

Navigate to:

    Interface Options → I2C → Enable

Install I²C tools if needed:

    sudo apt install -y i2c-tools

Verify the sensor is detected:

    i2cdetect -y 1

The SHT41 default I²C address is:

    0x44
  
## Node Configuration
### Properties
**I²C Bus** - Typically 1 on Raspberry Pi

**I²C Address** -   Default: 0x44

**Temperature Unit**	- °C or °F

## Usage

1. Add an Inject node.
2. Connect it to the SHT41 node.
3. Connect a Debug node to view the output.
4. Deploy.
5. Click Inject.

## Output

When triggered, the node outputs a message object:

    {
      "payload": {
        "temperature": 23.41,
        "humidity": 45.12,
        "unit": "C"
      }
    }

If Fahrenheit is selected:

    {
      "payload": {
        "temperature": 74.14,
        "humidity": 45.12,
        "unit": "F"
      }
    }

## Dependencies
* Node.js ≥ 16
* Node-RED ≥ 3.x
* I²C support on host device
