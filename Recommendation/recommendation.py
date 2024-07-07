import pandas as pd
import os

print(os.getcwd())

df = pd.read_csv('spotify_millsongdata.csv')
print(df)
