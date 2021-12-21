import json
import sqlite3
from pathlib import Path
import os

def DHT22_GPS_Data_Handler(jsonData):
	myfile = Path('data_gps')
	myfile.mkdir(exist_ok=True)
	json_Dict = json.loads(jsonData)
	SensorID = json_Dict['Sensor_ID']
	Data_and_Time = json_Dict['Date']
	accX = json_Dict['accX']
	accY = json_Dict['accY']
	accZ = json_Dict['accZ']
	return json_Dict
	
#===============================================================
# Master Function to Select DB Funtion based on MQTT Topic

def sensor_Data_Handler(Topic, jsonData):
	if Topic == "Home/BedRoom/DHT1/GPS":
		DHT22_GPS_Data_Handler(jsonData)
#===============================================================