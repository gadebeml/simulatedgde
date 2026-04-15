import zenoh, time, random
import requests

#POST http://iot-agent:7896/iot/d?i=motion004&k=1068318794  c|0
#url = "https://httpbin.org/post"  # Example URL that echoes back POST data

 

CLat1 = -24.55555
CLong1 = 23.22222
random.seed()
smartphones = ["smt-1","smt-2","smt-3","smt-4","smt-5","smt-6","smt-7","smt-8","smt-9","smt-10","smt-11","smt-12","smt-13","smt-14","smt-15","smt-16","smt-17","smt-18","smt-19","smt-20"]
#smartphones = ["smt-1","smt-2"] #,"smt-3","smt-4","smt-5","smt-6","smt-7","smt-8","smt-9","smt-10","smt-11","smt-12","smt-13","smt-14","smt-15","smt-16","smt-17","smt-18","smt-19","smt-20"]
def listener(sample):
    print("Hello")
    
    headers = {
        "Content-Type": "text/plain"
    }
        
    global CLong1
    CLong1 = CLong1 + 0.00005
    value = str(sample.payload) #//.strip("'");
    value = value.replace("'b","");
    value = value.strip("'");
    #print(value)
    url = "http://localhost:7896/iot/d?i="+ str(smartphones[random.randint(0,19)])+"&k=gde-tracker-11&d="+ value
    #url = "http://dcs-ems-test.ngei.csir.co.za:7896/iot/d?i="+ str(smartphones[random.randint(0,1)])+"&k=track111&d="+ value
    print(url)
    #payload = {"n": "100.32"}
    payload = {}
    response = requests.get(url, data=payload,headers=headers)
    print("Hello out",response.text)
    print("Hello out",response.status_code)
    #print(f"Received {sample.kind} ('{sample.key_expr}': '{sample.payload}')")
    #read Zenoh published tokens and publish to IoT Agent via HTTP
    

if __name__ == "__main__":
     cfg = zenoh.Config.from_json5('''{"connect": {"endpoints": ["tcp/129.151.173.231:7447"]}}''')
        #cfg = {"connect": {"endpoints": ["tcp/146.64.8.113:7447"]}}
     session = zenoh.open(cfg)
    #session = zenoh.open()
    #sub = session.declare_subscriber('myhome/kitchen/temp', listener)
     #with zenoh.open(cfg) as session:
     #session = zenoh.open(cfg)    
     sub = session.declare_subscriber('smartphone/topic', listener)
     time.sleep(120)