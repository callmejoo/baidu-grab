import http.client
import time

conn = http.client.HTTPConnection("www.baidu.com")

payload = "username=admin&password=admin"

headers = {
    'accept': "application/json, text/plain, */*",
    'origin': "http://localhost:8080",
    'x-devtools-emulate-network-conditions-client-id': "d5229f64-cd33-42cd-b91b-7c4047e8a212",
    'user-agent': "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36",
    'content-type': "application/x-www-form-urlencoded",
    'referer': "http://localhost:8080/?",
    'accept-language': "zh-CN,zh;q=0.8",
    'cache-control': "no-cache",
    }
t0 = time.clock()
conn.request("GET", "/s?ie=utf-8&wd=%E5%93%88%E5%93%88", payload, headers)

res = conn.getresponse()
data = res.read()
used = time.clock() - t0
print(data.decode())
print('耗时'+ str(used))