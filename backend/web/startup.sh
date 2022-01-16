#!/bin/bash

# generate tables
python models.py
# start up uvicorn
uvicorn main:app --host 0.0.0.0 --port 8080