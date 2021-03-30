import base64
import logging
from pathlib import Path
import re

BENCHMARK_CONFIG = """
hello_retail:
  description: Event-driven Retail application with HTTP api.
  provider: aws
  region: us-east-1
  stage: dev
  team: specrg
  company: cloud
"""


# API calls, ew=event-writer, pr=product-receive, pc=product-catalog


# SB calls

def prepare(spec):
  node_modules_path = Path(__file__).parent / 'node_modules'
  if not node_modules_path.exists():  # if no dependencies are installed, install dependencies
    spec.run(f"./install.sh {spec['region']} {spec['stage']} {spec['company']} {spec['team']}", image='serverless_cli')

  log = spec.run(f"./deploy.sh {spec['region']} {spec['stage']} {spec['company']} {spec['team']}", image='serverless_cli')

  urls = re.findall(r" [-] https://[-\w.]+execute-api[-\w.]+/\w+/[\w-]+", log)
  for url in urls:
    m = re.match(r" - (https://[-\w.]+/\w+)/event-writer", url)
    if m:
      spec['endpoint_event_writer_api'] = m.group(1)
    else:
      m = re.match(r" - (https://[-\w.]+/\w+)/categories", url)
      if m:
        spec['endpoint_product_catalog_api'] = m.group(1)
      else:
        m = re.match(r" - (https://[-\w.]+/\w+)/sms", url)
        if m:
          spec['endpoint_photo_receive_api'] = m.group(1)

  logging.info(f"endpoint event writer={spec['endpoint_event_writer_api']}")
  logging.info(f"endpoint product catalog={spec['endpoint_product_catalog_api']}")
  logging.info(f"endpoint photo receive={spec['endpoint_photo_receive_api']}")


def invoke(spec):
  image_source_file = "benchmark_images/snowdrop.jpg"
  image_target_file = "benchmark_images/snowdrop-base64.jpg"
  encodeImage(image_source_file, image_target_file)

  envs = {
    'EVENT_WRITER_URL': spec['endpoint_event_writer_api'],
    'PRODUCT_CATALOG_URL': spec['endpoint_product_catalog_api'],
    'PHOTO_RECEIVE_URL': spec['endpoint_photo_receive_api'],
    'IMAGE_FILE': image_target_file
  }
  spec.run_k6(envs)
  # out_options = f"--out csv={spec.workload_log_file()}"
  # spec.run(f'''k6 run {out_options} -e \"EVENT_WRITER_URL={spec['endpoint_event_writer_api']}\" \\
  #   -e \"PRODUCT_CATALOG_URL={spec['endpoint_product_catalog_api']}\" \\
  #   -e \"PHOTO_RECEIVE_URL={spec['endpoint_photo_receive_api']}\" \\
  #   -e \"IMAGE_FILE={image_target_file}\" workload_script.js''', image = 'loadimpact/k6:0.30.0')


def cleanup(spec):
  spec.run(f"./remove.sh {spec['region']} {spec['stage']} {spec['company']} {spec['team']}", image='serverless_cli')


# Util

def encodeImage(source_filename, target_filename):
  with open(source_filename, 'rb') as image:  # open binary file in read mode
    image_64_encode = base64.b64encode(image.read())
    with open(target_filename, "wb") as target_image_file:
      target_image_file.write(image_64_encode)
