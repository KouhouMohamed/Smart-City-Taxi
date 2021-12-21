import paho.mqtt.client as mqtt
import random, threading, json
from datetime import datetime
from time import sleep
import re
from pynput import keyboard
import socket,traceback
import time
import os
import sys
import math


GPS_CODE = "1"
ACCELEROMETRE_CODE = "3"

TYPES = ['TAXI', 'CLIENT']
IDS = ['MEHDI','AMARY','KOUHOU']

# coordinates Randoms
latitude = 33.57
longitude = -7.58

def generate_random_data(lat, lon):
        hex1 = '%012x' % random.randrange(16**12) # 12 char random string
        flt = float(random.randint(0,200))
        dec_lat = random.random()/100
        dec_lon = random.random()/100
        return (lat+dec_lat),(lon+dec_lon)


def on_press(key):
    print("on_press called *********")
    global break_program
    print (key)
    if key == keyboard.Key.enter:
        print ('end pressed')
        break_program = True
    return False



def mapMsgToJson(msg,addr):
    #print("mapMsgToJson called *********")
    dic={}
    #print("message received => "+str(msg))
    lst=re.split("[,\'']",str(msg))
    if(lst[2].strip() == GPS_CODE):
        lat,long = generate_random_data(latitude, longitude)
        #print("message splited => "+str(lst))
        # dic['Sensor_ID']=os.environ['COMPUTERNAME'].strip().replace(" ","")+' ' +str(addr)
        dic['Sensor_ID']=random.choice(IDS)
        dic['Date'] = (datetime.today()).strftime("%d-%b-%Y %H:%M:%S:%f")
        dic['accX']=lat
        # dic['accX']=lst[3].strip()
        # dic['accY']=lst[4].strip()
        dic['accY']=long
        dic['accZ']=lst[5].strip()
        # dic['type']='TAXI'
        dic['type']= random.choice(TYPES)
        return json.dumps(dic)


def script_embeddable_json(value):
    return (
        json.dumps(json.dumps(value))
        .replace("<", "\\u003c")
        .replace("\u2028", "\\u2028")
        .replace("\u2029", "\\u2029")
        .replace("'", "\"")
    )


def on_connect(client, userdata, rc):
    if rc != 0:
        pass
        print ("Unable to connect to MQTT Broker...")
    else:
        print ("Connected with MQTT Broker: " + str(MQTT_Broker))


def on_publish(client, userdata, mid):
    pass

def on_disconnect(client, userdata, rc):
    if rc !=0:
        pass

def publish_To_Topic(topic, message):
    mqttc.publish(topic,message)
    print ("Published: " + str(message) + " " + "on MQTT Topic: " + str(topic))
    print ("")


# MQTT Settings
MQTT_Broker = "test.mosquitto.org" #”mqtt.eclipse.org”#mqtt.groov.com
MQTT_Port = 1883
Keep_Alive_Interval = 30
MQTT_Topic_Acceleration = "Home/BedRoom/DHT1/GPS"
mqttc = mqtt.Client()

mqttc.on_connect=on_connect
mqttc.on_disconnect = on_disconnect
mqttc.on_publish = on_publish
mqttc.connect(MQTT_Broker, int(MQTT_Port), int(Keep_Alive_Interval))

break_program = False
host=''
port=5555
s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)
s.setsockopt(socket.SOL_SOCKET,socket.SO_BROADCAST,1)
s.bind((host,port))

with keyboard.Listener(on_press=on_press) as listener:
    while break_program == False:
        try:
            #print("success !! => ")
            message,address=s.recvfrom(8192)
            data = re.split("[,\'']",str(message))
            #print("data => ", data)
            if(data[2].strip() == GPS_CODE):
                acceleration_Json_Data=mapMsgToJson(message,address)
                publish_To_Topic (MQTT_Topic_Acceleration, acceleration_Json_Data)
                sleep(1) # make a pause
        except:
            print("error !!!")
            traceback.print_exc()
    listener.join()