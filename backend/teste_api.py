from flask import Flask

teste_api = Flask(__name__)

@teste_api.route("/")
def index(): 
    return "hello, world"