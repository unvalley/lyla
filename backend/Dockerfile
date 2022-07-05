FROM python:3.9-slim-buster

WORKDIR /app

COPY requirements.txt .
# コンテナ内で必要なパッケージをインストール
RUN apt update \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --trusted-host pypi.python.org -r requirements.txt

COPY /app .
EXPOSE 8000
# FastAPIを8000ポートで待機
CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]