from django.shortcuts import render
from django.http import JsonResponse
import pandas as pd
import os
import json

# Create your views here.

def index(request):
    return render(request, "index.html")

def data(request):
    data_set = pd.read_csv(os.path.join(os.path.abspath(os.path.dirname(__file__)), "./static/data.csv"))
    data_set.columns = ['Time', 'Sales']
    data_set['Time'] = pd.to_datetime(data_set['Time'])
    data_set.index = data_set['Time']
    data_set['Year'] = data_set.index.year

    s = data_set.groupby('Year')
    keys = list(s.groups.keys())

    median = s.median()

    lower_q = s.quantile(0.25)
    upper_q = s.quantile(0.75)

    iqr = upper_q - lower_q

    lower_limit = lower_q-1.5*iqr
    upper_limit = upper_q+1.5*iqr

    outliers = [[] for i in range(len(keys))]
    reg_nums = [[] for i in range(len(keys))]
    whiskers = [[] for i in range(len(keys))]

    for i in range(len(keys)):
        for j in range(len(data_set)):
            if data_set['Year'].iloc[j] == keys[i]:
                if data_set["Sales"].iloc[j] < lower_limit["Sales"].iloc[i]:
                    outliers[i].append(data_set["Sales"].iloc[j])
                if data_set["Sales"].iloc[j] > upper_limit["Sales"].iloc[i]:
                    outliers[i].append(data_set["Sales"].iloc[j])
                else:
                    reg_nums[i].append(data_set["Sales"].iloc[j])
        whiskers[i] = [min(float(s) for s in reg_nums[i]), max(float(s) for s in reg_nums[i])]
        
    return_data = []
    for i in range(len(keys)):
        return_data.append({
            "label": str(keys[i]),
            "median": median['Sales'].iloc[i],
            "whiskers": whiskers[i],
            "quartiles" :[lower_q['Sales'].iloc[i],upper_q['Sales'].iloc[i]],
            "outliers": outliers[i]
        })

    context = {
        "json_data": json.dumps(return_data)
    }
    
    return render(request, "return_data.json", context);