import zenoh, time
import requests

#POST http://iot-agent:7896/iot/d?i=motion004&k=1068318794  c|0
#url = "https://httpbin.org/post"  # Example URL that echoes back POST data

 

CLat1 = -24.55555
CLong1 = 23.22222

def listener(sample):
    print("Hello")
    
    headers = {
        "Content-Type": "text/plain"
    }
        
    global CLong1
    CLong1 = CLong1 + 0.00005
    value = (sample.payload)
    #url = "http://massive.meraka.csir.co.za:7896/iot/d?i=em003&k=123456789&d=e|"+value+"|s|ON"
    #url = "http://massive.meraka.csir.co.za:7896/iot/d?i=smt-1&k=gde-tracker-11&d=c|073455|b|www.tut.av.za|ss|gde-wifi|gps|24.55555|23.22222"
    #url = "http://massive.meraka.csir.co.za:7896/iot/d?i=spvm1&k=nano-tenant11&d=n|"+ str(value)+"|gps|"+str(CLong1)+","+str(CLat1)
    #url = "http://massive.meraka.csir.co.za:7896/iot/d?i=smt-1&k=gde-tracker-11&d=c|073455|b|www.tut.av.za|ss|gde-wifi|gps|24.55555|23.22222"
    url = "http://massive.meraka.csir.co.za:7896/iot/d?i=smt-3&k=gde-tracker-11&d=bsid|23|callT|indbound|callD|23sec|phoneNo|0123551001|sid|GDE_HR_Wifi|web|www.tutut.ac.za|siteD|30min|gps|"+str(CLong1)+","+str(CLat1)
    
    
    #url = "http://massive.meraka.csir.co.za:7896/iot/d?i=spvm1&k=nano-tenant11&d=n|45" 
    #url = "http://massive.meraka.csir.co.za:7896/iot/d?i=spvm1&k=nano-tenant11&d=n|"+value+"}gps|{CLat1}|{CLong1}"
    #url = "http://massive.meraka.csir.co.za:7896/iot/d?i=spvm1&k=nano-tenant11&d=n|"+value+""
    print(url)
    #payload = {"n": "100.32"}
    payload = {}
    response = requests.get(url, data=payload,headers=headers)
    print("Hello out",response.text)
    print("Hello out",response.status_code)
    print(f"Received {sample.kind} ('{sample.key_expr}': '{sample.payload}')")
    #read Zenoh published tokens and publish to IoT Agent via HTTP
    

if __name__ == "__main__":
     cfg = {"connect": {"endpoints": ["tcp/129.151.173.231:7447"]}}
        #cfg = {"connect": {"endpoints": ["tcp/146.64.8.113:7447"]}}
     session = zenoh.open(cfg)
    #sub = session.declare_subscriber('myhome/kitchen/temp', listener)
     #with zenoh.open(cfg) as session:
     session = zenoh.open(cfg)    
     sub = session.declare_subscriber('myhome/kitchen/temp', listener)
     time.sleep(120)