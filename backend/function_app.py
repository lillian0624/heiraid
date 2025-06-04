import azure.functions as func
from functionapp.uploadDocument import uploadDocument_blueprint

app = func.FunctionApp()
app.register_blueprint(uploadDocument_blueprint)
