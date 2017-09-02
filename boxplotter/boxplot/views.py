from django.shortcuts import render
from django.http import HttpResponse
import pandas as pd
import os
import json
import csv
import io
import sys

# Create your views here.
def calculate_data():
    data_set = pd.read_csv(os.path.join(os.path.abspath(os.path.dirname(__file__)), "./static/data_raw.csv"))
    data_set.columns = ['Time', 'Sales']
    data_set['Time'] = pd.to_datetime(data_set['Time'])
    data_set.index = data_set['Time']
    data_set['Year'] = data_set.index.year

    s = data_set.groupby('Year')
    keys = list(s.groups.keys())

    median = s.median()
    mean = s.mean()
    std = s.std()

    max_value = s.max()
    min_value = s.min()

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
                elif data_set["Sales"].iloc[j] > upper_limit["Sales"].iloc[i]:
                    outliers[i].append(data_set["Sales"].iloc[j])
                else:
                    reg_nums[i].append(data_set["Sales"].iloc[j])
        whiskers[i] = [round(min(float(s) for s in reg_nums[i]),2), round(max(float(s) for s in reg_nums[i]),2)]

    return_data = []
    for i in range(len(keys)):
        return_data.append({
            "label": str(keys[i]),
            "std_deviation": round(std['Sales'].iloc[i],2),
            "min": round(min_value['Sales'].iloc[i],2),
            "mean": round(mean['Sales'].iloc[i],2),
            "median": round(median['Sales'].iloc[i],2),
            "quartiles": [round(lower_q['Sales'].iloc[i],2), round((upper_q['Sales'].iloc[i]),2)],
            "whiskers": whiskers[i],
            "max": round(max_value['Sales'].iloc[i],2),
            "outliers": outliers[i]
        })
    return return_data

def index(request):
    return render(request, "index.html")

def data(request):
    context = {
        "json_data": json.dumps(calculate_data())
    }
    
    return render(request, "return_data.json", context)

def data_csv(request):
    data_set = calculate_data()

    if sys.version_info < (3,0):
        csv_data = io.BytesIO()
    else:
        csv_data = io.StringIO()

    writer = csv.writer(csv_data, quoting=csv.QUOTE_NONNUMERIC)
    writer.writerow(["label", "mean", "std. deviation", "min", "lower limit", "25% quartile", "median", "75% quartile", "upper limit", "max"])
    for i in range(len(data_set)):
        row = data_set[i]
        writer.writerow([row["label"], row["mean"], row["std_deviation"], row["min"], row["whiskers"][0], row["quartiles"][0], row["median"], row["quartiles"][1], row["whiskers"][1], row["max"]])

    response = HttpResponse(csv_data.getvalue(), content_type="text/csv")
    response["Content-Disposition"] = "attachment; filename=\"data.csv\""
    return response