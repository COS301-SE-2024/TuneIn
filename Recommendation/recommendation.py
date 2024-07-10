import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

for key in os.environ.keys():
    print(key)

