import zenoh, random, time

gde_simulated_data = []
#generate random values for zenoh

random.seed()
def read_data():
    with open("simulated_gde.txt", "r") as file:
        for line in file:
           global gde_simulated_data
           strLine = line.strip('\n');
           strLine = strLine.strip("'");           
           gde_simulated_data.append(strLine);
           
def read_temp():
    #generate random values from 15 to 30 as temperature values
    read_data()
    return gde_simulated_data[random.randint(0,99)]

#External zenoh configurartion
cfg = zenoh.Config.from_json5('''{connect: {endpoints: ["tcp/129.151.173.231:7447"]}}''')
session = zenoh.open(cfg)
#session = zenoh.open()
if __name__ == "__main__":
    #Zenoh topic to publish message
    key='smartphone/topic'
    pub = session.declare_publisher(key)
    while True:
        #read temp from a topic
        t=read_temp()
        buf=t
        print(buf)
       # print(f"Putting data ('{key}':'{buf}'..)")
        pub.put(buf)
        time.sleep(1)
            


            