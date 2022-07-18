From python:3
ENV PYTHONUNBUFFERED 1
WORKDIR /code
COPY requirements.txt /code/
RUN pip install -r requirements.txt
COPY . ./
EXPOSE 8000
