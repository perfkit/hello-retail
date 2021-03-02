import logging
import re

import requests

BENCHMARK_CONFIG = """
event_processing:
  description: Hello Retail Benchmark for AWS.
  provider: aws
  region: us-east-1
  root: ..
"""


# API calls, ew=event-writer, pr=product-receive, pc=product-catalog

def registerPhotographer(ew_url, pg_id, phone_number):
  data = {
    'schema': 'com.nordstrom/user-info/update-phone/1-0-0',
    'id': pg_id,
    'phone': phone_number,  # random 10-digit number
    'origin': 'hello-retail/sb-register-photographer/dummy_id/dummy_name',
  }
  resp = requests.post(url=ew_url + "/event-writer", json=data)
  if resp.status_code == 200:
    return resp
  else:
    raise Exception(f"Error code {resp.status_code}: {resp.content}")


def newProduct(ew_url, prod_id, prod_category, prod_name, prod_brand, prod_desc):
  data = {
    'schema': 'com.nordstrom/product/create/1-0-0',
    'id': prod_id,  # (`0000000${Math.floor(Math.abs(Math.random() * 10000000))}`).substr(-7) --> random 7-digit number
    'origin': 'hello-retail/sb-create-product/dummy_id/dummy_name',
    'category': prod_category.strip(),
    'name': prod_name.strip(),
    'brand': prod_brand.strip(),
    'description': prod_desc.strip(),
  }
  resp = requests.post(url=ew_url + "/event-writer", json=data)
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


def listProductsByID(pc_url, product_id):
  resp = requests.get(url=pc_url + f"/products?id={product_id}")
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
    'MediaUrl': image_url  # http://www.example.org/image.jpg
  }
  resp = requests.post(url=pr_url + "/sms", json=data)
  if resp.status_code == 200:
    return resp
  else:
    raise Exception(f"Error code {resp.status_code}: {resp.content}")


# SB calls

def prepare(spec):
  log = spec.run(f"./deploy.sh {spec['region']}", image='serverless_cli')

  urls = re.findall(r"^.*https://.*execute-api.*$", log)
  for url in urls:
    m = re.match(r".*POST - (https://[-\w.]+/\w+)/event-writer", url)
    if m:
      spec['endpoint_event_writer_api'] = m.group(1)
    else:
      m = re.match(r".*GET - (https://[-\w.]+/\w+)/categories", url)
      if m:
        spec['endpoint_product_catalog_api'] = m.group(1)
      else:
        m = re.match(r".*POST - (https://[-\w.]+/\w+)/sms", url)
        if m:
          spec['endpoint_photo_receive_api'] = m.group(1)

  logging.info(f"endpoint event writer={spec['endpoint']}")
  logging.info(f"endpoint product catalog={spec['endpoint']}")
  logging.info(f"endpoint photo receive={spec['endpoint']}")


def invokeAPI(response):
  logging.info(f"{response}")


def invoke(spec):
  invokeAPI(registerPhotographer(spec['endpoint_event_writer_api'], "photographer1", "1234567891"))
  invokeAPI(newProduct(spec['endpoint_event_writer_api'], "1234567", "category1", "name1", "brand1", "description1"))
  invokeAPI(listCategories(spec['endpoint_product_catalog_api']))
  invokeAPI(listProductsByCategory(spec['endpoint_product_catalog_api'], "category1"))
  invokeAPI(listProductsByID(spec['endpoint_product_catalog_api'], "1234567"))
  invokeAPI(commitPhoto(spec['endpoint_photo_receive_api'], "photographer1", "1234567891", "1234567", "https://cdn.vox-cdn.com/thumbor/th5YNVqlkHqkz03Va5RPOXZQRhA=/0x0:2040x1360/1200x800/filters:focal(857x517:1183x843)/cdn.vox-cdn.com/uploads/chorus_image/image/57358643/jbareham_170504_1691_0020.0.0.jpg"))


def cleanup(spec):
  spec.run(f"./remove.sh {spec['region']}", image='serverless_cli')
