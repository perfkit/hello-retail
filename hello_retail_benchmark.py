import logging
import re
import os, sys
import requests

BENCHMARK_CONFIG = """
event_processing:
  description: Hello Retail Benchmark for AWS.
  provider: aws
  region: us-east-1
  root: ..
"""

# API calls, ew=event-writer, pr=product-receive, pc=product-catalog

def registerPhotographer(ew_url, id, phone_number):
    data = {
      'schema': 'com.nordstrom/user-info/update-phone/1-0-0',
      'id': id,
      'phone': phone_number,    # random 10-digit number
      'origin': 'hello-retail/sb-register-photographer/dummy_id/dummy_name',
    }
    resp = requests.post(url=ew_url + "/event-writer/", json=data)
    if resp.status_code == 200:
        return resp
    else:
        raise Exception(f"Error code {resp.status_code}: {resp.content}")

def newProduct(ew_url, prod_id, prod_category, prod_name, prod_brand, prod_desc):
    data = {
      'schema': 'com.nordstrom/product/create/1-0-0',
      'id': prod_id,            # (`0000000${Math.floor(Math.abs(Math.random() * 10000000))}`).substr(-7) --> random 7-digit number
      'origin': 'hello-retail/sb-create-product/dummy_id/dummy_name',
      'category': prod_category.strip(),
      'name': prod_name.strip(),
      'brand': prod_brand.strip(),
      'description': prod_desc.strip(),
    }
    resp = requests.post(url=ew_url + "/event-writer/", json=data)
    if resp.status_code == 200:
        return resp
    else:
        raise Exception(f"Error code {resp.status_code}: {resp.content}")

def listCategories(pc_url):
    resp = requests.get(url=pc_url + "/categories")
    if resp.status_code == 200:
        return resp.json()
    else:
        raise Exception(f"Error code {resp.status_code}: {resp.content}")

def listProductsByCategory(pc_url, category):
    resp = requests.get(url=pc_url + f"/products?category={category}")  # category needs to be URI encoded!
    if resp.status_code == 200:
        return resp.json()
    else:
        raise Exception(f"Error code {resp.status_code}: {resp.content}")

def listProductsByID(pc_url, id):
    resp = requests.get(url=pc_url + f"/products?id={id}")
    if resp.status_code == 200:
        return resp.json()
    else:
        raise Exception(f"Error code {resp.status_code}: {resp.content}")

def commitPhoto(pr_url, pg_id, phone_number, item_id, image_url):
    data = {
      'photographer': {
        'id': pg_id,
        'phone': phone_number
      },
      'For': item_id,
      'MediaURL': image_url     # http://www.example.org/image.jpg
    }
    resp = requests.post(url=pr_url + "/sms", json=data)
    if resp.status_code == 200:
        return resp
    else:
        raise Exception(f"Error code {resp.status_code}: {resp.content}")
    

# SB calls

def prepare(spec):
    log = spec.run(f"./deploy.sh {spec['region']}", image='serverless_cli')  # TODO: region setting in deploy.sh file
    
    # TODO: echo api urls in deploy.sh file
    spec['endpoint_event_writer_api'] = re.sub("\\s+", "", log[log.rindex("https"):])
    spec['endpoint_product_catalog_api'] = re.sub("\\s+", "", log[log.rindex("https"):])
    spec['endpoint_photo_receive_api'] = re.sub("\\s+", "", log[log.rindex("https"):])
    
    logging.info(f"endpoint event writer={spec['endpoint']}")
    logging.info(f"endpoint product catalog={spec['endpoint']}")
    logging.info(f"endpoint photo receive={spec['endpoint']}")
    

def invoke(spec):
    print(registerPhotographer(spec['endpoint_event_writer_api'], "photographer1", "1234567891"))
    print(newProduct(spec['endpoint_event_writer_api'], "1234567", "category1", "name1", "brand1", "description1"))
    print(listCategories(spec['endpoint_product_catalog_api']))
    print(listProductsByCategory(spec['endpoint_product_catalog_api'], "category1"))
    print(listProductsByID(spec['endpoint_product_catalog_api'], "1234567"))
    print(commitPhoto(spec['endpoint_photo_receive_api'], "photographer1", "1234567891", "1234567", "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"))


def cleanup(spec):
    spec.run(f"./remove.sh {spec['region']}", image='serverless_cli')   # TODO: region setting in remove.sh file