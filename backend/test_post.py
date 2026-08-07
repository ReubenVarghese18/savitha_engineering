import urllib.request
import json

url = 'http://127.0.0.1:8000/enquiries/'
data = {
    'client_name': 'Reuben Test',
    'company': 'Savitha Engineering Partner',
    'email': 'reuben@savitha-test.com',
    'furnace_id': 3,
    'message': 'Requesting melting furnace quote for 1600C'
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        print("Response Code:", response.getcode())
        print("Response Body:", response.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
