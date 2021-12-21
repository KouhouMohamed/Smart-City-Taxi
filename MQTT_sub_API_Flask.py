import eventlet
from flask import Flask, render_template, Response
from flask.helpers import send_from_directory
import paho.mqtt.client as mqtt
from data_Handler import sensor_Data_Handler
from flask_mqtt import Mqtt
from flask_socketio import SocketIO
import json


# MQTT Settings
MQTT_Broker = "test.mosquitto.org"
MQTT_Port = 1883
Keep_Alive_Interval = 30
MQTT_Topic_GPS = "Home/BedRoom/DHT1/GPS"

app = Flask(__name__)

app.config['MQTT_BROKER_URL'] = MQTT_Broker
app.config['MQTT_BROKER_PORT'] = MQTT_Port
app.config['MQTT_USERNAME'] = ''
app.config['MQTT_PASSWORD'] = ''
app.config['MQTT_KEEPALIVE'] = Keep_Alive_Interval
app.config['MQTT_REFRESH_TIME'] = 1.0  # refresh time in seconds
mqtt = Mqtt(app)

@app.route('/')
def index():
    return render_template('index.html')

# Global variable
data =dict()

@mqtt.on_connect()
def handle_connect(client, userdata, flags, rc):
    mqtt.subscribe(MQTT_Topic_GPS)

@mqtt.on_message()
def handle_mqtt_message(client, userdata, message):
    global data
    data = dict(
        topic=message.topic,
        payload=message.payload.decode()
    )
    print("our data : " + str(data).replace("'", "\""))


#Consumer API
@app.route('/topic/GPS')
def get_messages():
    def events():
            yield "data:{0}\n\n".format(data)
    return Response(events(), mimetype="text/event-stream")



def script_embeddable_json(value):
    return (
        json.dumps(json.dumps(value))
        .replace("<", "\\u003c")
        .replace("\u2028", "\\u2028")
        .replace("\u2029", "\\u2029")
        .replace("'", "\"")
    )

if __name__ == '__main__':
    app.run(debug=True, port=8080)
