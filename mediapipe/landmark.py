import json
from sys import set_asyncgen_hooks
from unittest import result
from flask import request
from flask import Flask, render_template
app = Flask(__name__)
import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import TensorBoard
#from sklearn.model_selection import train_test_split
#from tensorflow.keras.utils import to_categorica
from sklearn.metrics import multilabel_confusion_matrix, accuracy_score


mp_holistic = mp.solutions.holistic #holistic
mp_drawing = mp.solutions.drawing_utils #drawing utilities

def mediapipe_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) #BGR 2 RGB
    image.flags.writeable = False                  #Image is no longer writeable
    results = model.process(image)                 #Make prediction
    image.flags.writeable = True                   #Image is now writeable
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR) #RGB 2 BGR
    return image, results

def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, lh, rh])

def draw_landmarks(image, results):
    mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS) #draw pose connection
    mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS) #draw left hand connection
    mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS) #draw right hand connection

actions = np.array(['สวัสดี','ชื่อ','นามสกุล','อายุ','ขอบคุณ','ขอโทษ','ใคร','อะไร','ทำไม','เท่าไร','ไหน','อย่างไร','พ่อ','แม่','พี่','น้อง','ลูก','หลาน','ผู้ชาย','ฉัน','เธอ','ผู้หญิง', 'เด็ก', 'เขา'])
no_sequences = 30
sequence_length = 30
label_map = {label:num for num, label in enumerate(actions)}
model = Sequential()
model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(4,258)))
model.add(LSTM(128, return_sequences=True, activation='relu'))
model.add(LSTM(64, return_sequences=False, activation='relu'))
model.add(Dense(64, activation='relu'))
model.add(Dense(32, activation='relu'))
model.add(Dense(actions.shape[0], activation='softmax'))
model.load_weights('action2.h5')

from scipy import stats

@app.route('/python', methods=['POST'])
def python():
    output = request.get_json()
    print(output)
    #result = json.loads(output) #this converts the json output to a python dictionary
    #print(result)
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        file = r'D:/nene/final_project/web_ThSignLan/FP_Back/collect/'
        frame =  cv2.imread(file+output["file_name"])
        image,results = mediapipe_detection(frame, holistic)
        draw_landmarks(image, results)
   
    try :
        pose = []
        for res in results.pose_landmarks.landmark:
            test = np.array([res.x, res.y, res.z, res.visibility])
            pose.append(test)
    except :
        result_test = np.zeros(258)
        np.save('landmark/'+ output["file_name"] , result_test)
        return "waiting"

    result_test = extract_keypoints(results)
    np.save('landmark/'+ output["file_name"] , result_test)

    if len(output['count']) == 4 :
        sequence = []
        sentence = []
        predictions = []
        threshold = 0.6
        with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
            sequence = [np.load('landmark/'+ text+'.npy') for text in output["count"]]
            if len(sequence) == 4:
                res = model.predict(np.expand_dims(sequence, axis=0))[0]
                predictions.append(np.argmax(res))

                if np.unique(predictions[-10:])[0]==np.argmax(res):
                    if res[np.argmax(res)] > threshold:
                        if len(sentence) > 0:
                            if actions[np.argmax(res)] != sentence[-1]:
                                sentence.append(actions[np.argmax(res)])
                        else:
                            sentence.append(actions[np.argmax(res)])
                        return actions[np.argmax(res)]

    return "waiting"

app.run(host="localhost", port=3001)